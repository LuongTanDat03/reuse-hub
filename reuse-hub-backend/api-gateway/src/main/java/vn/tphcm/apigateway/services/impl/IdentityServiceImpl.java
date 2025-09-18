/*
 * @ (#) IdentityServiceImpll.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import vn.tphcm.apigateway.dtos.request.IdentityRequest;
import vn.tphcm.apigateway.dtos.ApiResponse;
import vn.tphcm.apigateway.dtos.response.IdentityResponse;
import vn.tphcm.apigateway.repositories.IdentityClient;
import vn.tphcm.apigateway.services.IdentityService;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "IDENTITY-SERVICE")
public class IdentityServiceImpl implements IdentityService {
    private final IdentityClient identityRepository;

    @Override
    public Mono<ApiResponse<IdentityResponse>> introspect(String token) {
        log.info("Introspecting token...");

        return identityRepository.introspect(IdentityRequest.builder()
                    .token(token)
                .build());
    }
}
