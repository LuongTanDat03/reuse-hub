/*
 * @ (#) AuthenticationFilter.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.configs;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import vn.tphcm.apigateway.dtos.response.ApiResponse;
import vn.tphcm.apigateway.services.IdentityService;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j(topic = "AUTHENTICATION-FILTER")
@RequiredArgsConstructor
public class AuthenticationFilter implements GlobalFilter, Ordered {
    private final IdentityService identityService;
    private final ObjectMapper objectMapper;

    @NonFinal
    private String[] publicEndpoints = {
            ".*/identity/auth/.*"
    };

    @Value("${app.api-prefix}")
    @NonFinal
    private String apiPrefix;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Entering authentication filter...");

        if (isPublicEndpoint(exchange.getRequest())) {
            return chain.filter(exchange);
        }

        String token = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (token == null || !token.startsWith("Bearer ")) {
            return unauthenticated(exchange.getResponse());
        }

        token = token.substring(7);
        log.info("Token: {}", token);

        return identityService.introspect(token).flatMap(introspectResponseApiResponse -> {
            if (introspectResponseApiResponse.getData().isValid()) {
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", introspectResponseApiResponse.getData().getUserId())
                        .header("X-User-Username", introspectResponseApiResponse.getData().getUsername())
                        .header("X-User-Roles", String.join(",", introspectResponseApiResponse.getData().getRoles() == null ? List.of() : introspectResponseApiResponse.getData().getRoles()))
                        .header("X-User-Permissions", String.join(",", introspectResponseApiResponse.getData().getPermissions() == null ? List.of() : introspectResponseApiResponse.getData().getPermissions()))
                        .build();

                return chain.filter(exchange.mutate()
                        .request(modifiedRequest)
                        .build());

            } else {
                return unauthenticated(exchange.getResponse());
            }
        }).onErrorResume(throwable -> {
            log.error("Error when introspect token: {}", throwable.getMessage());
            return unauthenticated(exchange.getResponse());
        });
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();

        boolean isPublicEndpoint = Arrays.stream(publicEndpoints).anyMatch(s -> path.matches(apiPrefix + s));
        
        log.info("Path: {} is Public: {}", path, isPublicEndpoint);
        
        return isPublicEndpoint;
    }

    private Mono<Void> unauthenticated(ServerHttpResponse response) {
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .status(401)
                .message("Unauthenticated")
                .build();

        String body = null;

        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}
