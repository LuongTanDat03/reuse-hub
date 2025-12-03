/*
 * @ (#) ProfileClient.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.clients;

/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.tphcm.identityservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.response.ProfileResponse;

import java.util.List;

@FeignClient(name = "profile-service", url = "${feign.client.config.profile-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ProfileClient {
    @PostMapping(value = "/internal/users/profiles", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<ProfileResponse>> getProfilesByUserIds(@RequestBody List<String> userIds);
}
