/*
 * @ (#) UserClient.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.adminservice.commons.UserStatus;
import vn.tphcm.adminservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.PageResponse;
import vn.tphcm.adminservice.dto.response.InfoUserResponse;
import vn.tphcm.adminservice.dto.response.UserStatisticsResponse;

import java.util.Map;

/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

@FeignClient(name = "identity-service", url = "${feign.client.config.identity-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface UserClient {

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PageResponse<InfoUserResponse>> getAllUsers(@RequestParam(defaultValue = "0") int pageNo,
                                                            @RequestParam(defaultValue = "10") int pageSize,
                                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                                            @RequestParam(defaultValue = "desc") String sortDirection);

    @GetMapping(value = "/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserStatisticsResponse> getUserStatistics();

    @PutMapping(value = "/{userId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> updateUserStatus(@PathVariable String userId, @RequestParam UserStatus status);

    @PutMapping(value = "/{userId}/password", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> resetPassword(@PathVariable String userId, @RequestBody String newPassword);
}
