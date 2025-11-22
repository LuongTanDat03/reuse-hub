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
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import vn.tphcm.apigateway.dtos.ApiResponse;
import vn.tphcm.apigateway.dtos.request.IntrospectRequest;
import vn.tphcm.apigateway.dtos.response.IntrospectResponse;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j(topic = "AUTHENTICATION-FILTER")
@RequiredArgsConstructor
public class AuthenticationFilter implements GlobalFilter, Ordered {
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @NonFinal
    private String[] publicEndpoints = {
            ".*/identity/auth/.*",
            ".*/items/public/.*",
            ".*/payments/stripe/webhook"
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

        List<String> authHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);

        if (CollectionUtils.isEmpty(authHeaders)) {
            return unauthenticated(exchange.getResponse());
        }

        String token = authHeaders.get(0).replace("Bearer ", "");

        log.info("Authorization header: {}", token);

        return webClientBuilder.build().post()
                .uri("lb://identity-service/identity/auth/introspect")
                .bodyValue(new IntrospectRequest(token))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<ApiResponse<IntrospectResponse>>() {
                })
                .flatMap(apiResponse -> {
                    if (apiResponse != null && apiResponse.getData() != null && apiResponse.getData().isValid()) {
                        log.info("Token is valid. Proceeding to the next filter...");
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", apiResponse.getData().getUserId())
                                .build();
                        ServerWebExchange mutatedExchange = exchange.mutate()
                                .request(mutatedRequest)
                                .build();
                        return chain.filter(mutatedExchange);
                    } else {
                        log.info("Token is invalid. Returning unauthenticated response...");
                        return unauthenticated(exchange.getResponse());
                    }
                }).onErrorResume(throwable -> {
                    log.error("Error during token introspection: {}", throwable.getMessage());
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
           log.error("Failed to serialize unauthenticated response", e);
           body = "{\"status\":401,\"message\":\"Unauthenticated\"}";
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}
