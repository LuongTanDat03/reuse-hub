/*
 * @ (#) IdentityService.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */


import reactor.core.publisher.Mono;
import vn.tphcm.apigateway.dtos.ApiResponse;
import vn.tphcm.apigateway.dtos.response.IntrospectResponse;

public interface IdentityService {
    Mono<ApiResponse<IntrospectResponse>> introspect(String token);
}
