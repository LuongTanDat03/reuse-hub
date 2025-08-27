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
            "/v1/auth/.*"
    };

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Entering authentication filter...");

        if(isPublicEndpoint(exchange.getRequest())){
            return chain.filter(exchange);
        }

        List<String> authHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);

        if(CollectionUtils.isEmpty(authHeaders)){
            return unauthenticated(exchange.getResponse());
        }

        String token = authHeaders.getFirst().replace("Bearer ", "");

        log.info("Token: {}", token);

        return identityService.introspect(token).flatMap(introspectResponseApiResponse -> {
            if(introspectResponseApiResponse.getData().getValid()){
                return chain.filter(exchange);
            }else {
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

    private boolean isPublicEndpoint(ServerHttpRequest request){
        return Arrays.stream(publicEndpoints).anyMatch(s -> request.getURI().getPath().matches(s));
    }

    private Mono<Void> unauthenticated(ServerHttpResponse response){
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .status(401)
                .message("Unauthenticated")
                .build();

        String body = null;

        try{
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
}
