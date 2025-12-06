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
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.dto.*;
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
    @Value("${rabbitmq.exchanges.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.routing-keys.transaction.created}")
    private String transactionCreatedRK;
    @Value("${rabbitmq.routing-keys.transaction.completed}")
    private String transactionCompletedRK;
    @Value("${rabbitmq.routing-keys.transaction.cancelled}")
    private String transactionCancelledRK;
    @Value("${rabbitmq.routing-keys.transaction.updated}")
    private String transactionUpdatedRK;
    @Value("${rabbitmq.routing-keys.transaction.status-updated}")
    private String transactionStatusUpdatedRK;
    @Value("${rabbitmq.routing-keys.notification}")
    private String notificationRK;

    @Value("${rabbitmq.routing-keys.saga.feedback.submitted}")
    private String feedbackSubmittedRK;
    
    @Value("${rabbitmq.routing-keys.wallet.credit}")
    private String walletCreditRK;

    @Override
    public void publishTransactionEvent(TransactionEventMessage event) {
        try {
            String exchange;
            String routingKey;

            switch (event.getEventType()) {
                case CREATED:
                    exchange = sagaExchange;
                    routingKey = transactionCreatedRK;
                    break;
                case COMPLETED:
                    exchange = transactionExchange;
                    routingKey = transactionCompletedRK;
                    break;
                case CANCELLED:
                    exchange = transactionExchange;
                    routingKey = transactionCancelledRK;
                    break;
                default:
                    exchange = transactionExchange;
                    routingKey = transactionUpdatedRK;
                    if (event.getEventType() != EventType.UPDATED) {
                        log.warn("Unknown event type: {}", event.getEventType());
                    }
                    break;
            }

            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Published transaction event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish transaction event: {}", e.getMessage());
        }
    }

    @Override
    public void publishUpdateTransactionEvent(TransactionUpdateEvent event) {
        try {
            String routingKey = transactionStatusUpdatedRK;
            rabbitTemplate.convertAndSend(transactionExchange, routingKey, event);
            log.info("Published update transaction event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish update transaction event: {}", e.getMessage());
        }
    }

    @Override
    public void publishNotification(NotificationMessage event) {
        try {
            rabbitTemplate.convertAndSend(notificationExchange,
                    notificationRK, event);
            log.info("Published notification event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish notification event: {}", e.getMessage());
        }
    }

    @Override
    public void publishFeedbackEvent(FeedbackEvent event) {
        try {
            rabbitTemplate.convertAndSend(transactionExchange,
                    feedbackSubmittedRK, event);
            log.info("Published feedback event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish feedback event: {}", e.getMessage());
        }
    }

    @Override
    public void publishWalletEvent(WalletEvent event) {
        try {
            rabbitTemplate.convertAndSend(transactionExchange, walletCreditRK, event);
            log.info("Published wallet credit event for user {}: {} VND", event.getUserId(), event.getAmount());
        } catch (Exception e) {
            log.error("Failed to publish wallet event: {}", e.getMessage());
        }
    }
}
