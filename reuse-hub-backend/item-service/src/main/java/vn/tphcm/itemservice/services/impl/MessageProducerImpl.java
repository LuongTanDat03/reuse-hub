/*
 * @ (#) MessageProducerImpl.java       1.0     9/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/20/2025
 */

import vn.tphcm.event.dto.EventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.itemservice.configs.RabbitMQConfig;
import vn.tphcm.itemservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishItemEvent(EventMessage event) {
        try {
            String routingKey = getRoutingKeyForEventType(event.getEventType());
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_ITEM, routingKey, event);
            log.info("Published item event: type={}, routingKey={} for item: {}", event.getEventType(), routingKey, event.getItemId());
        } catch (Exception e) {
            log.error("Failed to publish item event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotification(NotificationMessage notification) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NOTIFICATION, "notification.send", notification);
            log.info("Published notification for user: {}", notification.getRecipientUserId());
        } catch (Exception e) {
            log.error("Failed to publish notification: {}", e.getMessage());
        }
    }

    private String getRoutingKeyForEventType(String eventType) {
        return switch (eventType) {
            case "ITEM_CREATED" -> RabbitMQConfig.ROUTING_KEY_ITEM_CREATED;
            case "ITEM_UPDATED" -> RabbitMQConfig.ROUTING_KEY_ITEM_UPDATED;
            case "ITEM_DELETED" -> RabbitMQConfig.ROUTING_KEY_ITEM_DELETED;
            case "ITEM_LIKED" -> RabbitMQConfig.ROUTING_KEY_ITEM_LIKED;
            case "ITEM_UNLIKED" -> RabbitMQConfig.ROUTING_KEY_ITEM_UNLIKED;
            case "ITEM_VIEWED" -> RabbitMQConfig.ROUTING_KEY_ITEM_VIEWED;
            default -> "item.unknown";
        };
    }
}
