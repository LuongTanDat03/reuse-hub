/*
 * @ (#) IdentityClient.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.repositories;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.PostExchange;
import reactor.core.publisher.Mono;
import vn.tphcm.apigateway.dtos.request.IdentityRequest;
import vn.tphcm.apigateway.dtos.response.ApiResponse;
import vn.tphcm.apigateway.dtos.response.IdentityResponse;

@Repository
public interface IdentityRepository {
    @PostExchange(url = "/v1/auth/introspect", contentType = MediaType.APPLICATION_JSON_VALUE)
    Mono<ApiResponse<IdentityResponse>> introspect(@RequestBody IdentityRequest request);
}
