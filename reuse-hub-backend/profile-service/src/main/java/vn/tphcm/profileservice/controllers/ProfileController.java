/*
 * @ (#) ProfileController.java       1.0     9/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 9/16/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.request.ProfileUpdateRequest;
import vn.tphcm.profileservice.dtos.response.ProfileResponse;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.services.ProfileService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
@Slf4j(topic = "PROFILE-CONTROLLER")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get profile for user id", description = "Get profile for user id")
    public ApiResponse<ProfileResponse> getProfile(@PathVariable String userId) {
        log.info("Get profile for userId: {}", userId);

        return profileService.getProfile(userId);
    }

    @PutMapping("/update")
    @Operation(summary = "Update profile for user", description = "Update profile for user")
    public ApiResponse<ProfileResponse> updateProfile(@RequestPart(value = "request", required = false) ProfileUpdateRequest request,
                                                   @RequestPart(value = "file", required = false) MultipartFile file) {
        log.info("Update profile for user: {}", request);

        return profileService.updateProfile(request, file);
    }
}
