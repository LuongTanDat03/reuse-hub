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

import org.springframework.beans.factory.annotation.Value;
import vn.tphcm.event.dto.EventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.ItemReservationEvent;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.itemservice.configs.RabbitMQConfig;
import vn.tphcm.itemservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.item}")
    private String EXCHANGE_ITEM;
    @Value("${rabbitmq.exchange.notification}")
    private String EXCHANGE_NOTIFICATION;
    @Value("${rabbitmq.exchange.saga}")
    private String SAGA_EXCHANGE;

    @Value("${rabbitmq.routing-key.item.created}")
    private String ROUTING_KEY_ITEM_CREATED;
    @Value("${rabbitmq.routing-key.item.liked}")
    private String ROUTING_KEY_ITEM_LIKED;
    @Value("${rabbitmq.routing-key.item.unliked}")
    private String ROUTING_KEY_ITEM_UNLIKED;
    @Value("${rabbitmq.routing-key.item.deleted}")
    private String ROUTING_KEY_ITEM_DELETED;
    @Value("${rabbitmq.routing-key.item.updated}")
    private String ROUTING_KEY_ITEM_UPDATED;
    @Value("${rabbitmq.routing-key.item.viewed}")
    private String ROUTING_KEY_ITEM_VIEWED;

    @Value("${rabbitmq.routing-key.saga.item-reserved}")
    private String itemReservedRK;
    @Value("${rabbitmq.routing-key.saga.item-reservation-cancelled}")
    private String itemReservedFailedRK;

    @Override
    public void publishItemEvent(EventMessage event) {
        try {
            String routingKey = getRoutingKeyForEventType(event.getEventType());
            rabbitTemplate.convertAndSend(EXCHANGE_ITEM, routingKey, event);
            log.info("Published item event: type={}, routingKey={} for item: {}", event.getEventType(), routingKey, event.getItemId());
        } catch (Exception e) {
            log.error("Failed to publish item event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotification(NotificationMessage notification) {
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NOTIFICATION, "notification.send", notification);
            log.info("Published notification for user: {}", notification.getRecipientUserId());
        } catch (Exception e) {
            log.error("Failed to publish notification: {}", e.getMessage());
        }
    }

    @Override
    public void publishItemReservationResult(ItemReservationEvent event) {
        String routingKey = event.isSuccess() ? itemReservedRK : itemReservedFailedRK;
        try {
            rabbitTemplate.convertAndSend(SAGA_EXCHANGE, routingKey, event);
            log.info("Published item reservation event: transactionId={}, success={}, routingKey={}",
                    event.getTransactionId(), event.isSuccess(), routingKey);
        } catch (Exception e) {
            log.error("Failed to publish item reservation event: {}", e.getMessage());
        }
    }

    private String getRoutingKeyForEventType(String eventType) {
        return switch (eventType) {
            case "ITEM_CREATED" -> ROUTING_KEY_ITEM_CREATED;
            case "ITEM_UPDATED" -> ROUTING_KEY_ITEM_UPDATED;
            case "ITEM_DELETED" -> ROUTING_KEY_ITEM_DELETED;
            case "ITEM_LIKED" -> ROUTING_KEY_ITEM_LIKED;
            case "ITEM_UNLIKED" -> ROUTING_KEY_ITEM_UNLIKED;
            case "ITEM_VIEWED" -> ROUTING_KEY_ITEM_VIEWED;
            default -> "item.unknown";
        };
    }
}
