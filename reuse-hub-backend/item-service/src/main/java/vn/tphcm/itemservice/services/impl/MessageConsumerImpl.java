/*
 * @ (#) MessageConsumer.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services.impl;
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
import vn.tphcm.event.dto.FeedbackEvent;
import vn.tphcm.event.dto.ItemReservationEvent;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.event.dto.TransactionEventMessage;
import vn.tphcm.itemservice.commons.ItemStatus;
import vn.tphcm.itemservice.exceptions.InvalidDataException;
import vn.tphcm.itemservice.exceptions.ResourceNotFoundException;
import vn.tphcm.itemservice.models.Item;
import vn.tphcm.itemservice.repositories.ItemRepository;
import vn.tphcm.itemservice.services.ItemService;
import vn.tphcm.itemservice.services.MessageConsumer;
import vn.tphcm.itemservice.services.MessageProducer;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONSUMER")
public class MessageConsumerImpl implements MessageConsumer {
    private final ItemRepository itemRepository;
    private final MessageProducer messageProducer;
    private final ItemService itemService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.item-process}")
    @Transactional
    public void handleTransactionEvent(TransactionEventMessage event) {
        if (event == null || event.getItemId() == null) {
            log.warn("Received null transaction event or itemId");
            return;
        }

        log.info("Processing transaction event: {}", event);

        try {
            Item item = itemRepository.findById(event.getItemId())
                    .orElseThrow(() -> new InvalidDataException("Item not found with ID: " + event.getItemId()));

            switch (event.getEventType()) {
                case CREATED -> handleTransactionCreated(event, item);
                case CANCELLED -> handleTransactionCancelled(event, item);
                case COMPLETED -> handleTransactionCompleted(event, item);
                default -> log.warn("Unhandled transaction event type: {}", event.getEventType());
            }
        } catch (ResourceNotFoundException e) {
            log.error("Error processing transaction event: {}", e.getMessage());
            if (event.getEventType() == EventType.CREATED) {
                ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .transactionId(event.getTransactionId())
                        .itemId(event.getItemId())
                        .success(false)
                        .message("Item not found")
                        .build();

                messageProducer.publishItemReservationResult(itemReservationEvent);
            }
        } catch (Exception e) {
            log.error("SAGA Failed: Unexpected error processing transaction event for {}. Error: {}",
                    event.getTransactionId(), e.getMessage(), e);
            if (event.getEventType() == EventType.CREATED) {
                ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .transactionId(event.getTransactionId())
                        .itemId(event.getItemId())
                        .success(false)
                        .message("Item is not available")
                        .build();

                messageProducer.publishItemReservationResult(itemReservationEvent);
            }
        }
    }

    private void handleTransactionCreated(TransactionEventMessage event, Item item) {
        if (item.getStatus() == ItemStatus.AVAILABLE) {
            item.setStatus(ItemStatus.RESERVED);
            itemRepository.save(item);
            log.info("SAGA Processed: Item {} status updated to RESERVED for transaction {}",
                    item.getId(), event.getTransactionId());

            ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .transactionId(event.getTransactionId())
                    .itemId(item.getId())
                    .success(true)
                    .message("Item reserved successfully")
                    .build();
            messageProducer.publishItemReservationResult(itemReservationEvent);
        } else {
            log.warn("SAGA Failed: Item {} is NOT AVAILABLE (Status: {}) for transaction {}",
                    item.getId(), item.getStatus(), event.getTransactionId());

            ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .transactionId(event.getTransactionId())
                    .itemId(item.getId())
                    .success(false)
                    .message("Item is not available")
                    .build();

            messageProducer.publishItemReservationResult(itemReservationEvent);
        }
    }

    private void handleTransactionCancelled(TransactionEventMessage event, Item item) {
        if (item.getStatus() == ItemStatus.RESERVED) {
            item.setStatus(ItemStatus.AVAILABLE);
            itemRepository.save(item);
            log.info("SAGA Processed: Item {} status updated to AVAILABLE due to transaction {} cancellation",
                    item.getId(), event.getTransactionId());
        } else {
            log.warn("SAGA Ignored: Transaction {} cancelled, but item {} was not in RESERVED status (current: {}). No status change needed.",
                    event.getTransactionId(), item.getId(), item.getStatus());
        }
    }

    private void handleTransactionCompleted(TransactionEventMessage event, Item item) {
        if (item.getStatus() == ItemStatus.RESERVED) {
            item.setStatus(ItemStatus.SOLD);
            itemRepository.save(item);
            log.info("SAGA Processed: Item {} status updated to SOLD due to transaction {} completion",
                    item.getId(), event.getTransactionId());
        } else {
            log.warn("SAGA Ignored: Transaction {} completed, but item {} was not in RESERVED status (current: {}).",
                    event.getTransactionId(), item.getId(), item.getStatus());
        }
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.feedback-process}")
    @Transactional
    public void handleFeedbackSubmitted(FeedbackEvent event) {
        if (event == null || event.getItemId() == null) {
            log.error("Received invalid FeedbackEvent (null or no itemId)");
            return;
        }

        log.info("SAGA Event Received: FEEDBACK_SUBMITTED for itemId: {}",
                event.getItemId());

        try {
            itemService.processNewFeedback(event);
            log.info("SAGA Processed: Feedback for item {} successfully stored.", event.getItemId());

        } catch (Exception e) {
            log.error("SAGA Failed: Could not process feedback for item {}. Reason: {}",
                    event.getItemId(), e.getMessage(), e);
        }
    }

    @Override
//    @RabbitListener(queues = "${rabbitmq.queue.payment.item-boost}")
    public void handlePaymentEvent(PaymentEvent event) {

    }


}
