/*
 * @ (#) MessageConsumerImpl.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.dto.ItemReservationEvent;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.exceptions.ResourceNotFoundException;
import vn.tphcm.transactionservice.models.Transaction;
import vn.tphcm.transactionservice.repositories.TransactionRepository;
import vn.tphcm.transactionservice.services.MessageConsumer;
import vn.tphcm.transactionservice.services.MessageProducer;
import vn.tphcm.transactionservice.services.TransactionService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONSUMER")
public class MessageConsumerImpl implements MessageConsumer {
    private final TransactionRepository transactionRepository;
    private final MessageProducer messageProducer;
    private final TransactionService transactionService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.saga.transaction-update-reserved}")
    @Transactional
    public void handleItemReserved(ItemReservationEvent event) {
        if (event == null || !event.isSuccess()) {
            log.debug("Skipping invalid or unsuccessful event in handleItemReserved listener for transaction {}", (event != null ? event.getTransactionId() : "NULL"));
            return;
        }

        log.info("SAGA Reply Received: ITEM_RESERVED for transactionId: {}", event.getTransactionId());

        Transaction transaction = transactionRepository.findById(event.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found during SAGA reply (RESERVED): " + event.getTransactionId()));

        if (transaction.getStatus() == TransactionStatus.PENDING) {
            if (transaction.getTotalAmount() != null && transaction.getTotalAmount() > 0) {
                log.info("Transaction {} requires payment of amount: {}", transaction.getId(), transaction.getTotalAmount());
                transaction.setStatus(TransactionStatus.PAYMENT_PENDING);

                NotificationMessage notification = NotificationMessage.builder()
                        .notificationId(UUID.randomUUID().toString())
                        .recipientUserId(transaction.getBuyerId())
                        .title("Payment Required")
                        .message("Please proceed to payment for your transaction involving the item: '" + transaction.getItemTitle() + "'.")
                        .type(EventType.CREATED)
                        .itemId(transaction.getItemId())
                        .transactionId(transaction.getId())
                        .build();
                messageProducer.publishNotification(notification);

            }else {
                transaction.setStatus(TransactionStatus.RESERVED);
                log.info("Transaction {} has zero total amount, skipping payment step.", transaction.getId());
            }
            transactionRepository.save(transaction);
            log.info("SAGA Processed: Transaction {} status updated to RESERVED", transaction.getId());

            NotificationMessage notification = NotificationMessage.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .recipientUserId(transaction.getSellerId())
                    .title("New Item Request")
                    .message("You have a new exchange request for your item: '" + transaction.getItemTitle() + "'")
                    .type(EventType.CREATED)
                    .itemId(transaction.getItemId())
                    .transactionId(transaction.getId())
                    .build();
            messageProducer.publishNotification(notification);
            log.info("Notification sent to seller {} for transaction {}", transaction.getSellerId(), transaction.getId());

        } else {
            log.warn("SAGA Ignored: Transaction {} was not in PENDING status (current: {}) when ITEM_RESERVED event was received.",
                    transaction.getId(), transaction.getStatus());
        }
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.saga.transaction-update-failed}")
    @Transactional
    public void handleItemReservationFailed(ItemReservationEvent event) {
        if (event == null || event.isSuccess()) {
            log.debug("Skipping invalid or successful event in handleItemReservationFailed listener.");
            return;
        }

        log.warn("SAGA Reply Received: ITEM_RESERVATION_FAILED for transactionId: {}. Reason: {}",
                event.getTransactionId(), event.getMessage());

        Transaction transaction = transactionRepository.findById(event.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found during SAGA failure reply (FAILED): " + event.getTransactionId()));

        if (transaction.getStatus() == TransactionStatus.PENDING) {
            transaction.setStatus(TransactionStatus.CANCELLED);
            transaction.setReason("Item reservation failed: " + event.getMessage());
            transaction.setCancelledBy("SYSTEM");
            transaction.setCancelledAt(java.time.LocalDateTime.now());
            transactionRepository.save(transaction);
            log.warn("SAGA Processed: Transaction {} status updated to CANCELLED due to item reservation failure", transaction.getId());

            NotificationMessage notification = NotificationMessage.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .recipientUserId(transaction.getBuyerId())
                    .title("Transaction Request Cancelled")
                    .message("Your request for the item '" + transaction.getItemTitle() + "' was cancelled because the item is no longer available.")
                    .type(EventType.CANCELLED)
                    .itemId(transaction.getItemId())
                    .transactionId(transaction.getId())
                    .build();
            messageProducer.publishNotification(notification);
            log.info("Notification sent to buyer {} for cancelled transaction {}", transaction.getBuyerId(), transaction.getId());

        } else {
            log.warn("SAGA Ignored: Transaction {} was not in PENDING status (current: {}) when ITEM_RESERVATION_FAILED event was received.",
                    transaction.getId(), transaction.getStatus());
        }
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queues.payment.transaction-payment}")
    @Transactional
    public void handlePaymentEvent(PaymentEvent event) {
        if (event == null) {
            log.error("Received invalid PaymentSagaEvent (null)");
            return;
        }

        log.info("SAGA Event Received: Payment event for paymentId: {}. LinkedTransactionId: {}",
                 event.getPaymentId(), event.getLinkedTransactionId());

        try {
            transactionService.processPaymentResult(event);

        } catch (Exception e) {
             log.error("SAGA Failed: Could not process payment result for transaction {}. Reason: {}",
                      event.getLinkedTransactionId(), e.getMessage(), e);
        }
    }
}
