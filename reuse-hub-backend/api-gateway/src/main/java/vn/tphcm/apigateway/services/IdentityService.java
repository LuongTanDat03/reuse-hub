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
import vn.tphcm.apigateway.dtos.response.ApiResponse;
import vn.tphcm.apigateway.dtos.response.IdentityResponse;

public interface IdentityService {
    public Mono<ApiResponse<IdentityResponse>> introspect(String token);
}
