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
import vn.tphcm.itemservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.item}")
    private String exchangeItem;
    @Value("${rabbitmq.exchange.notification}")
    private String exchangeNotification;
    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.routing-key.item.created}")
    private String routingKeyItemCreated;
    @Value("${rabbitmq.routing-key.item.liked}")
    private String routingKeyItemLiked;
    @Value("${rabbitmq.routing-key.item.unliked}")
    private String routingKeyItemUnliked;
    @Value("${rabbitmq.routing-key.item.deleted}")
    private String routingKeyItemDeleted;
    @Value("${rabbitmq.routing-key.item.updated}")
    private String routingKeyItemUpdated;
    @Value("${rabbitmq.routing-key.item.viewed}")
    private String routingKeyItemViewed;

    @Value("${rabbitmq.routing-key.saga.item-reserved}")
    private String itemReservedRK;
    @Value("${rabbitmq.routing-key.saga.item-reservation-cancelled}")
    private String itemReservedFailedRK;

    @Override
    public void publishItemEvent(EventMessage event) {
        try {
            String routingKey = getRoutingKeyForEventType(event.getEventType());
            rabbitTemplate.convertAndSend(exchangeItem, routingKey, event);
            log.info("Published item event: type={}, routingKey={} for item: {}", event.getEventType(), routingKey, event.getItemId());
        } catch (Exception e) {
            log.error("Failed to publish item event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotification(NotificationMessage notification) {
        try {
            rabbitTemplate.convertAndSend(exchangeNotification, "notification.send", notification);
            log.info("Published notification for user: {}", notification.getRecipientUserId());
        } catch (Exception e) {
            log.error("Failed to publish notification: {}", e.getMessage());
        }
    }

    @Override
    public void publishItemReservationResult(ItemReservationEvent event) {
        String routingKey = event.isSuccess() ? itemReservedRK : itemReservedFailedRK;
        try {
            rabbitTemplate.convertAndSend(sagaExchange, routingKey, event);
            log.info("Published item reservation event: transactionId={}, success={}, routingKey={}",
                    event.getTransactionId(), event.isSuccess(), routingKey);
        } catch (Exception e) {
            log.error("Failed to publish item reservation event: {}", e.getMessage());
        }
    }

    private String getRoutingKeyForEventType(String eventType) {
        return switch (eventType) {
            case "ITEM_CREATED" -> routingKeyItemCreated;
            case "ITEM_UPDATED" -> routingKeyItemUpdated;
            case "ITEM_DELETED" -> routingKeyItemDeleted;
            case "ITEM_LIKED" -> routingKeyItemLiked;
            case "ITEM_UNLIKED" -> routingKeyItemUnliked;
            case "ITEM_VIEWED" -> routingKeyItemViewed;
            default -> "item.unknown";
        };
    }
}
