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
import vn.tphcm.event.dto.PresenceEvent;
import vn.tphcm.event.dto.TypingEvent;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PUBLISHER")
public class MessagePublisherImpl implements MessagePublisher {

    @Value("${rabbitmq.exchange.chat}")
    private String chatExchange;

    @Value("${rabbitmq.routing-keys.message}")
    private String messageRoutingKey;

    @Value("${rabbitmq.routing-keys.presence}")
    private String presenceRoutingKey;

    @Value("${rabbitmq.routing-keys.typing}")
    private String typingRoutingKey;

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
    public void publishPresence(PresenceEvent event) {
        try {
            rabbitTemplate.convertAndSend(chatExchange, presenceRoutingKey, event);
            log.info("Published presence event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish presence event: {}", e.getMessage());
        }
    }

    @Override
    public void publishTyping(TypingEvent event) {
        try {
            rabbitTemplate.convertAndSend(chatExchange, typingRoutingKey, event);
            log.info("Published typing event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish typing event: {}", e.getMessage());
        }
    }
}
