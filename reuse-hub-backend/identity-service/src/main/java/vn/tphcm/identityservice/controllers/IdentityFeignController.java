/*
 * @ (#) IdentityFeignController.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.identityservice.commons.UserStatus;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.PageResponse;
import vn.tphcm.identityservice.dtos.response.InfoUserResponse;
import vn.tphcm.identityservice.dtos.response.UserStatisticsResponse;
import vn.tphcm.identityservice.services.UserService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/identity-feign")
@Slf4j(topic = "IDENTITY-FEIGN-CONTROLLER")
public class IdentityFeignController {
    private final UserService userService;

    @GetMapping
    public ApiResponse<PageResponse<InfoUserResponse>> getAllUsers(@RequestParam(defaultValue = "0") int pageNo,
                                                        @RequestParam(defaultValue = "10") int pageSize,
                                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                                        @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Feign request to get all users - pageNo: {}, pageSize: {}, sortBy: {}, sortDirection: {}",
                pageNo, pageSize, sortBy, sortDirection);

        return userService.getAllUsers(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/statistics")
    public ApiResponse<UserStatisticsResponse> getUserStatistics() {
        log.info("Feign request to get user statistics");

        return userService.getUserStatistics();
    }

    @PutMapping("/{userId}/status")
    public ApiResponse<Void> updateUserStatus(@PathVariable String userId, @RequestParam UserStatus status) {
        log.info("Feign request to update user status - userId: {}, status: {}", userId, status);

        return userService.updateStatusUser(userId, status);
    }
}
