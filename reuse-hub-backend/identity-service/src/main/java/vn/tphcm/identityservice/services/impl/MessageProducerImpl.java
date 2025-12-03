/*
 * @ (#) MessageProducerImpl.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.identityservice.configs.RabbitMQConfig;
import vn.tphcm.identityservice.dtos.request.ProfileUserRequest;
import vn.tphcm.identityservice.services.MessageProducer;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishVerificationEmail(NotificationMessage event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_VERIFICATION,
                RabbitMQConfig.RK_VERIFICATION_ITEM,
                event,
                message -> {
                    message.getMessageProperties().setMessageId(UUID.randomUUID().toString());
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    return message;
                }
        );

        log.info("📨 Sent verification email event to RabbitMQ: recipient={}, subject={}, template={}",
                event.getRecipient(),
                event.getSubject(),
                event.getTemplateCode());
    }

    @Override
    public void publishProfileCreation(ProfileUserRequest request) {
        try {
            log.info("Publishing profile creation message for userId: {}", request.getUserId());
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_PROFILE,
                    RabbitMQConfig.RK_PROFILE_CREATE,
                    request
            );
        } catch (Exception e) {
            log.error("Failed to publish profile creation message: {}", e.getMessage());
        }
    }
}
