/*
 * @ (#) ProfileFeignController.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.response.ProfileResponse;
import vn.tphcm.profileservice.services.ProfileService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile-feign")
@Slf4j(topic = "PROFILE-FEIGN-CONTROLLER")
public class ProfileFeignController {
    private final ProfileService profileService;

    @PostMapping("/internal/users/profiles")
    public ApiResponse<List<ProfileResponse>> getProfilesByUserIds(@RequestBody List<String> userIds) {
        log.info("Get profiles for userIds: {}", userIds);
        return profileService.getProfilesByUserIds(userIds);
    }
}
