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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.services.ProfileService;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "INTERNAL-USER-CONTROLLER")
public class InternalUserController {
    private final ProfileService profileService;

    @RabbitListener(queues = "${rabbitmq.queues.user-profile-creation}")
    public void handleProfileCreation(ProfileUserRequest request) {
        try {
            log.info("Create profile for user: {}", request);
            profileService.createProfile(request);
        } catch (Exception e) {
            log.error("Error creating profile for user: {}, error: {}", request, e.getMessage());
        }
    }
}
