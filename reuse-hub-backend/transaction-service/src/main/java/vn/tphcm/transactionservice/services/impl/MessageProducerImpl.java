/*
 * @ (#) MessagePublisherImpl.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.TransactionEventMessage;
import vn.tphcm.event.dto.TransactionUpdateEvent;
import vn.tphcm.transactionservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PUBLISHER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;
    @Value("${rabbitmq.exchanges.transaction-exchange}")
    private String transactionExchange;

    @Value("${rabbitmq.exchanges.notification-exchange}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-keys.transaction-routing-key}")
    private String transactionRoutingKey;

    @Value("${rabbitmq.routing-keys.notification-routing-key}")
    private String notificationRoutingKey;

    @Value("${rabbitmq.routing-keys.web-socket-routing-key}")
    private String webSocketRoutingKey;

    @Override
    public void publishTransactionEvent(TransactionEventMessage event) {
        try {
            rabbitTemplate.convertAndSend(transactionExchange,
                    transactionRoutingKey, event);
            log.info("Published transaction event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish transaction event: {}", e.getMessage());
        }
    }

    @Override
    public void publishUpdateTransactionEvent(TransactionUpdateEvent event) {
        try {
            rabbitTemplate.convertAndSend(transactionExchange,
                    webSocketRoutingKey, event);
            log.info("Published update transaction event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish update transaction event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotification(NotificationMessage event) {
        try {
            rabbitTemplate.convertAndSend(notificationExchange,
                    notificationRoutingKey, event);
            log.info("Published notification event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish notification event: {}", e.getMessage());
        }
    }
}
