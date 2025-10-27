/*
 * @ (#) TransactionServiceImpl.java       1.0     10/24/2025
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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.common.EventType;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.TransactionEventMessage;
import vn.tphcm.event.dto.TransactionUpdateEvent;
import vn.tphcm.transactionservice.client.ItemServiceClient;
import vn.tphcm.transactionservice.commons.ItemStatus;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.response.ItemResponse;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.exceptions.InvalidDataException;
import vn.tphcm.transactionservice.mappers.TransactionMapper;
import vn.tphcm.transactionservice.models.Transaction;
import vn.tphcm.transactionservice.repositories.TransactionRepository;
import vn.tphcm.transactionservice.services.MessagePublisher;
import vn.tphcm.transactionservice.services.TransactionService;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "TRANSACTION-SERVICE")
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final MessagePublisher messagePublisher;
    private final ItemServiceClient itemServiceClient;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> createTransaction(CreateTransactionRequest request, String userId) {
        if (transactionRepository.hasActiveTransactionForItem(request.getItemId(), userId)){
            log.warn("User {} already has an active transaction for item {}", userId, request.getItemId());
            throw new InvalidDataException("An active transaction already exists for this item.");
        }

        ApiResponse<ItemResponse> response = itemServiceClient.getItemById(request.getItemId());

        try {
            ItemResponse item = response.getData();
            if (item == null) {
                log.error("Item with ID {} not found in item-service", request.getItemId());
                throw new InvalidDataException("Item not found. Please check the item ID and try again.");
            }

            if (item.getStatus() != ItemStatus.AVAILABLE){
                log.error("Item {} is not available for transaction. Current status: {}", request.getItemId(), item.getStatus());
                throw new InvalidDataException("Item is not available for transaction.");
            }

            if (item.getUserId().equals(userId)){
                log.error("User {} cannot create transaction for their own item {}", userId, request.getItemId());
                throw new InvalidDataException("You cannot create a transaction for your own item.");
            }
        }catch (Exception e) {
            log.error("Error to get item details form item-service: {}", e.getMessage());
            throw new InvalidDataException("Failed to retrieve item information. Please try again later.");
        }

        String itemImageUrl = (response.getData().getImages() != null && !response.getData().getImages().isEmpty())
                ? response.getData().getImages().get(0)
                : null;

        Long totalAmount = response.getData().getPrice() * request.getQuantity();

        Transaction transaction = Transaction.builder()
                .itemId(request.getItemId())
                .itemTitle(response.getData().getTitle())
                .itemImageUrl(itemImageUrl)
                .itemPrice(response.getData().getPrice())
                .buyerId(userId)
                .sellerId(response.getData().getUserId())
                .status(TransactionStatus.PENDING)
                .type(request.getTransactionType())
                .quantity(request.getQuantity())
                .totalAmount(totalAmount)
                .deliveryMethod(request.getDeliveryMethod())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryPhone(request.getDeliveryPhone())
                .deliveryNotes(request.getDeliveryNotes())
                .buyerNotes(request.getBuyerNotes())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        transaction = transactionRepository.save(transaction);

        try {
            itemServiceClient.updateItemStatus(request.getItemId(), ItemStatus.RESERVED);
            log.info("Item {} status updated to RESERVED in item-service", request.getItemId());
        } catch (Exception e){
            log.error("Failed to update item {} status to RESERVED in item-service: {}", request.getItemId(), e.getMessage());
        }

        publishTransactionEvent(transaction, EventType.CREATED, "Transaction created and pending payment.");
        publishTransactionUpdate(transaction, TransactionStatus.PENDING, "Transaction created.");

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(response.getData().getUserId())
                .title("New Transaction Created")
                .message("A new transaction has been created for your item: " + response.getData())
                .type(EventType.CREATED)
                .itemId(request.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        log.info("Transaction {} created successfully by user {}", transaction.getId(), userId);

        return ApiResponse.<TransactionResponse>builder()
                .status(CREATED.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Transaction created successfully.")
                .build();
    }

    @Override
    public ApiResponse<TransactionResponse> completeTransaction(String userId, String transactionId, TransactionStatus status) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getBuyerId().equals(userId)){
            log.error("User {} is not authorized to complete transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to complete this transaction.");
        }

        if (transaction.getStatus() != TransactionStatus.DELIVERY){
            log.error("Transaction {} is not in DELIVERY status. Current status: {}", transactionId, transaction.getStatus());
            throw new InvalidDataException("Transaction cannot be completed in its current status.");
        }

        TransactionStatus oldStatus = transaction.getStatus();

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setCompletedAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        try {
            itemServiceClient.updateItemStatus(transaction.getItemId(), ItemStatus.SOLD);
            log.info("Item {} status updated to SOLD in item-service after transaction {} completion", transaction.getItemId(), transactionId);
        } catch (Exception e){
            log.error("Failed to update item {} status to SOLD in item-service: {}", transaction.getItemId(), e.getMessage());
        }

        publishTransactionEvent(transaction, EventType.COMPLETED, "Transaction completed successfully.");
        publishTransactionUpdate(transaction, oldStatus, "Transaction completed.");

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getSellerId())
                .title("Transaction Completed")
                .message("The transaction for your item " + transaction.getItemTitle() + " has been completed.")
                .type(EventType.COMPLETED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        log.info("Transaction {} completed successfully by user {}", transactionId, userId);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Method not implemented yet.")
                .build();
    }

    @Override
    public ApiResponse<TransactionResponse> cancelTransaction(String userId, String transactionId, String reason) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getBuyerId().equals(userId) && !transaction.getSellerId().equals(userId)){
            log.error("User {} is not authorized to cancel transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to cancel this transaction.");
        }

        if (transaction.getStatus() == TransactionStatus.COMPLETED || transaction.getStatus() == TransactionStatus.CANCELLED){
            log.error("Transaction {} cannot be cancelled as it is already {}", transactionId, transaction.getStatus());
            throw new InvalidDataException("Transaction cannot be cancelled in its current status.");
        }

        TransactionStatus oldStatus = transaction.getStatus();

        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction.setCancelledBy(userId);
        transaction.setCancelledAt(LocalDateTime.now());
        transaction.setReason(reason);
        transaction = transactionRepository.save(transaction);

        try {
            itemServiceClient.updateItemStatus(transaction.getItemId(), ItemStatus.AVAILABLE);
            log.info("Item {} status updated to AVAILABLE in item-service after transaction {} cancellation", transaction.getItemId(), transactionId);
        } catch (Exception e){
            log.error("Failed to update item {} status to AVAILABLE in item-service: {}", transaction.getItemId(), e.getMessage());
        }

        publishTransactionEvent(transaction, EventType.CANCELLED, "Transaction has been cancelled.");
        publishTransactionUpdate(transaction, oldStatus, "Transaction cancelled.");

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getBuyerId().equals(userId) ? transaction.getSellerId() : transaction.getBuyerId())
                .title("Transaction Cancelled")
                .message("The transaction for item " + transaction.getItemTitle() + " has been cancelled. Reason: " + reason)
                .type(EventType.CANCELLED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        log.info("Transaction {} cancelled successfully by user {}", transactionId, userId);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Method not implemented yet.")
                .build();
    }

    @Override
    public ApiResponse<TransactionResponse> updateTransactionStatus(String userId, String transactionId, TransactionStatus status) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getSellerId().equals(userId)){
            log.error("User {} is not authorized to update transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to update this transaction.");
        }

        TransactionStatus oldStatus = transaction.getStatus();

        if (status == TransactionStatus.DELIVERY){
            transaction.setDeliveryTrackingCode(UUID.randomUUID().toString());
        }

        transaction.setStatus(status);
        transaction = transactionRepository.save(transaction);

        publishTransactionEvent(transaction, EventType.UPDATED, "Transaction status updated to " + status);
        publishTransactionUpdate(transaction, oldStatus, "Transaction status updated to " + status);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getBuyerId())
                .title("Transaction Status Updated")
                .message("The status of your transaction for item " + transaction.getItemTitle() + " has been updated to " + status)
                .type(EventType.UPDATED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        log.info("Transaction {} status updated to {} by user {}", transactionId, status, userId);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Update transaction status successfully.")
                .build();
    }

    @Override
    public ApiResponse<TransactionResponse> confirmDelivery(String userId, String transactionId, String trackingCode) {
        return null;
    }

    @Override
    public ApiResponse<TransactionResponse> submitFeedback(String userId, String transactionId) {
        return null;
    }

    @Override
    @Scheduled(fixedDate = 360000)
    @Transactional
    public void processExpiredTransaction() {
        Transaction transaction = transactionRepository.
    }


    private void publishTransactionEvent(Transaction transaction, EventType type, String message){
        TransactionEventMessage event = TransactionEventMessage.builder()
                .eventType(type)
                .transactionId(transaction.getId())
                .buyerId(transaction.getBuyerId())
                .sellerId(transaction.getSellerId())
                .itemId(transaction.getItemId())
                .itemTitle(transaction.getItemTitle())
                .totalAmount(transaction.getTotalAmount())
                .status(transaction.getStatus())
                .message(message)
                .build();

        messagePublisher.publishTransactionEvent(event);
    }

    private void publishTransactionUpdate(Transaction transaction, TransactionStatus previousStatus,String message){
        TransactionUpdateEvent event = TransactionUpdateEvent.builder()
                .transactionId(transaction.getId())
                .userId(transaction.getBuyerId())
                .status(transaction.getStatus())
                .previousStatus(previousStatus)
                .updateMessage(message)
                .build();

        messagePublisher.publishUpdateTransactionEvent(event);
    }

    private Transaction getTransactionIfExists(String transactionId) {
        return transactionRepository.findById(transactionId).orElseThrow(() -> {
            log.error("Transaction {} not found", transactionId);
            return new InvalidDataException("Transaction not found.");
        });
    }
}
