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

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.dto.*;
import vn.tphcm.itemservice.commons.ItemStatus;
import vn.tphcm.itemservice.exceptions.InvalidDataException;
import vn.tphcm.itemservice.exceptions.ResourceNotFoundException;
import vn.tphcm.itemservice.models.Item;
import vn.tphcm.itemservice.repositories.ItemRepository;
import vn.tphcm.itemservice.services.CacheService;
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
    private final CacheService cacheService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.item-process}")
    @Transactional
    public void handleTransactionEvent(TransactionEventMessage event, Channel channel, Message message) throws Exception {
        try {
            if (event == null || event.getItemId() == null) {
                log.warn("Received null transaction event or itemId");
                channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
                return;
            }

            log.info("Processing transaction event: {}", event);

            Item item = itemRepository.findById(event.getItemId())
                    .orElseThrow(() -> new InvalidDataException("Item not found with ID: " + event.getItemId()));

            switch (event.getEventType()) {
                case CREATED -> handleTransactionCreated(event, item);
                case CANCELLED -> handleTransactionCancelled(event, item);
                case COMPLETED -> handleTransactionCompleted(event, item);
                default -> log.warn("Unhandled transaction event type: {}", event.getEventType());
            }

            // Acknowledge success
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            log.debug("Transaction event acknowledged for transaction {}", event.getTransactionId());

        } catch (ResourceNotFoundException e) {
            log.error("Error processing transaction event: {}", e.getMessage());
            if (event != null && event.getEventType() == EventType.CREATED) {
                ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .transactionId(event.getTransactionId())
                        .itemId(event.getItemId())
                        .success(false)
                        .message("Item not found")
                        .build();
                messageProducer.publishItemReservationResult(itemReservationEvent);
            }
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        } catch (Exception e) {
            log.error("SAGA Failed: Unexpected error processing transaction event for {}. Error: {}",
                    event != null ? event.getTransactionId() : "NULL", e.getMessage(), e);
            if (event != null && event.getEventType() == EventType.CREATED) {
                ItemReservationEvent itemReservationEvent = ItemReservationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .transactionId(event.getTransactionId())
                        .itemId(event.getItemId())
                        .success(false)
                        .message("Item is not available")
                        .build();
                messageProducer.publishItemReservationResult(itemReservationEvent);
            }
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
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

            cacheService.evictCachedItem(item.getId());
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

            cacheService.evictCachedItem(item.getId());
            cacheService.evictAllItems();
        } else {
            log.warn("SAGA Ignored: Transaction {} completed, but item {} was not in RESERVED status (current: {}).",
                    event.getTransactionId(), item.getId(), item.getStatus());
        }
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.feedback-process}")
    @Transactional
    public void handleFeedbackSubmitted(FeedbackEvent event, Channel channel, Message message) throws Exception {
        try {
            if (event == null || event.getItemId() == null) {
                log.error("Received invalid FeedbackEvent (null or no itemId)");
                channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
                return;
            }

            log.info("SAGA Event Received: FEEDBACK_SUBMITTED for itemId: {}", event.getItemId());

            itemService.processNewFeedback(event);
            log.info("SAGA Processed: Feedback for item {} successfully stored.", event.getItemId());

            cacheService.evictCachedItem(event.getItemId());
            cacheService.evictAllItems();
            // Acknowledge success
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            log.debug("Feedback event acknowledged for item {}", event.getItemId());

        } catch (Exception e) {
            log.error("SAGA Failed: Could not process feedback for item {}. Reason: {}",
                    event != null ? event.getItemId() : "NULL", e.getMessage(), e);
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.payment.item-boost}")
    @Transactional
    public void handlePaymentEvent(PaymentEvent event, Channel channel, Message message) throws Exception {
        try {
            if (event == null || event.getLinkedItemId() == null) {
                log.warn("Received null payment event or linkedItemId");
                channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
                return;
            }

            log.info("SAGA Event Received: Payment event for itemId: {}, transactionId: {}, success: {}",
                    event.getLinkedItemId(), event.getLinkedTransactionId(), event.isSuccess());

            Item item = itemRepository.findById(event.getLinkedItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + event.getLinkedItemId()));

            if (event.isSuccess()) {
                // Payment completed successfully
                if (item.getStatus() == ItemStatus.RESERVED) {
                    item.setStatus(ItemStatus.SOLD);
                    itemRepository.save(item);

                    cacheService.evictCachedItem(event.getLinkedItemId());
                    cacheService.evictAllItems();
                    log.info("SAGA Processed: Item {} status updated to SOLD after payment completion", item.getId());
                } else {
                    log.warn("SAGA Ignored: Payment completed for item {} but item status is {} (expected RESERVED)",
                            item.getId(), item.getStatus());
                }
            } else {
                // Payment failed
                if (item.getStatus() == ItemStatus.RESERVED) {
                    item.setStatus(ItemStatus.AVAILABLE);
                    itemRepository.save(item);

                    cacheService.evictCachedItem(event.getLinkedItemId());
                    cacheService.evictAllItems();
                    log.info("SAGA Processed: Item {} status updated to AVAILABLE after payment failure", item.getId());
                } else {
                    log.warn("SAGA Ignored: Payment failed for item {} but item status is {} (expected RESERVED)",
                            item.getId(), item.getStatus());
                }
            }

            // Acknowledge success
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            log.debug("Payment event acknowledged for item {}", event.getLinkedItemId());

        } catch (ResourceNotFoundException e) {
            log.error("SAGA Failed: Item not found for payment event: {}", e.getMessage());
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        } catch (Exception e) {
            log.error("SAGA Failed: Unexpected error processing payment event for item {}. Error: {}",
                    event != null ? event.getLinkedItemId() : "NULL", e.getMessage(), e);
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    @Override
    @RabbitListener(queues = "q.item.update-tags")
    @Transactional
    public void handleAiTagsGenerated(AiTagsGeneratedEvent event, Channel channel, Message message) throws Exception {
        try {
            log.info("Received AI_TAGS_GENERATED for item: {}", event.getItemId());
            
            itemService.updateItemTagsFromAi(event.getItemId(), event.getTags());
            
            // Acknowledge success
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            log.debug("AI tags event acknowledged for item {}", event.getItemId());
            
        } catch (Exception e) {
            log.error("Failed to update tags from AI: {}", e.getMessage(), e);
            // Send to DLQ
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }


}
