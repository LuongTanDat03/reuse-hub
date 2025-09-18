/*
 * @ (#) UserController.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.services.ProfileService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/internal")
@Slf4j(topic = "INTERNAL-USER-CONTROLLER")
public class InternalUserController {
    private final ProfileService profileService;

    @PostMapping("/users")
    @Operation(summary = "Create user profile", description = "This endpoint allows internal services to create a user profile.")
    public ApiResponse<UserResponse> createProfile(@RequestBody ProfileUserRequest request) {
        log.info("Create profile for user: {}", request);

        return profileService.createProfile(request);
    }
}
