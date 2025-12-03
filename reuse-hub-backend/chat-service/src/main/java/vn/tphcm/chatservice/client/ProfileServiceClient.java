/*
 * @ (#) ProfileClient.java       1.0     11/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.client;
/*
 * @author: Luong Tan Dat
 * @date: 11/13/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import vn.tphcm.chatservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.response.ProfileResponse;

@FeignClient(name = "profile-service", url = "${feign.client.config.profile-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ProfileServiceClient {
    @GetMapping(value = "/profile/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ProfileResponse> getProfile(@PathVariable String userId);
}
