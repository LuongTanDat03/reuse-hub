/*
 * @ (#) MessagePublisher.java       1.0     10/15/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/15/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.services.MessagePublisher;
import vn.tphcm.event.dto.MessageEvent;
import vn.tphcm.event.dto.NotificationMessage;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PUBLISHER")
public class MessagePublisherImpl implements MessagePublisher {
    @Value("${rabbitmq.exchange.chat}")
    private String chatExchange;

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-keys.notification}")
    private String notificationRoutingKey;
    @Value("${rabbitmq.routing-keys.message}")
    private String messageRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishMessage(MessageEvent event) {
        try {
            rabbitTemplate.convertAndSend(chatExchange, messageRoutingKey, event);
            log.info("Published message event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish message event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotificationMessage(NotificationMessage event) {
        try {
            rabbitTemplate.convertAndSend(notificationExchange, notificationRoutingKey, event);
        } catch (Exception e) {
            log.error("Failed to publish notification message event: {}", e.getMessage());
        }
    }
}
