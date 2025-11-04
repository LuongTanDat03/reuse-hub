/*
 * @ (#) MessageProducerImpl.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.paymentservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;
    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-key.saga.payment-completed}")
    private String paymentCompletedRK;
    @Value("${rabbitmq.routing-key.saga.payment-failed}")
    private String paymentFailedRK;
    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRK;

    @Override
    public void publishPaymentCompletedEvent(PaymentEvent event) {
        try {
            rabbitTemplate.convertAndSend(sagaExchange, paymentCompletedRK, event);
            log.info("Published SAGA Event: PAYMENT_COMPLETED for paymentId: {}", event.getPaymentId());
        } catch (Exception e) {
            log.error("Failed to publish PAYMENT_COMPLETED event: {}", e.getMessage(), e);
        }
    }

    @Override
    public void publishPaymentFailedEvent(PaymentEvent event) {
        try {
            rabbitTemplate.convertAndSend(sagaExchange, paymentFailedRK, event);
            log.info("Published SAGA Event: PAYMENT_FAILED for paymentId: {}", event.getPaymentId());
        } catch (Exception e) {
            log.error("Failed to publish PAYMENT_FAILED event: {}", e.getMessage(), e);
        }
    }

    @Override
    public void publishNotification(NotificationMessage notification) {
        try {
            rabbitTemplate.convertAndSend(notificationExchange, notificationRK, notification);
            log.info("Published Notification Request: recipientUserId={}", notification.getRecipientUserId());
        } catch (Exception e) {
            log.error("Failed to publish notification: {}", e.getMessage(), e);
        }
    }
}
