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

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.services.ProfileService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "INTERNAL-USER-CONTROLLER")
public class InternalUserController {
    private final ProfileService profileService;

    @RabbitListener(queues = "${rabbitmq.queues.user-profile-creation}")
    public void handleProfileCreation(ProfileUserRequest request, Channel channel, Message message) {
        try {
            log.info("Received profile creation request for userId: {}", request.getUserId());
            profileService.createProfile(request);
            log.info("Successfully created profile for userId: {}", request.getUserId());

            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (DataIntegrityViolationException e) {
            log.warn("Profile already exists for userId: {} - Skipping duplicate creation", request.getUserId());
            try {
                channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
            } catch (IOException ioException) {
                log.error("Failed to NACK message: {}", ioException.getMessage());
            }
        } catch (Exception e) {
            log.error("Error creating profile for userId: {}, error: {}", request.getUserId(), e.getMessage(), e);
            try {
                channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
            } catch (IOException ioException) {
                log.error("Failed to NACK message: {}", ioException.getMessage());
            }
        }
    }
}
