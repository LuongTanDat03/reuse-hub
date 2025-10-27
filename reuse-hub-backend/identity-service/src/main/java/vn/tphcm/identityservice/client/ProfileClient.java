/*
 * @ (#) ProfileClient.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.client;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.tphcm.identityservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.identityservice.dtos.request.ProfileUserRequest;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.response.UserResponse;

@FeignClient(name = "profile-service", url = "${feign.client.config.profile-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
@Repository
public interface ProfileClient {
    @PostMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserResponse> createProfile(@RequestBody ProfileUserRequest request);
}
