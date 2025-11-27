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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.dto.*;
import vn.tphcm.transactionservice.client.ItemServiceClient;
import vn.tphcm.transactionservice.commons.ItemStatus;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.PageResponse;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.response.ItemResponse;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.dtos.response.TransactionStatisticsResponse;
import vn.tphcm.transactionservice.exceptions.InvalidDataException;
import vn.tphcm.transactionservice.mappers.TransactionMapper;
import vn.tphcm.transactionservice.models.Transaction;
import vn.tphcm.transactionservice.repositories.TransactionRepository;
import vn.tphcm.transactionservice.services.MessageProducer;
import vn.tphcm.transactionservice.services.TransactionService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "TRANSACTION-SERVICE")
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final MessageProducer messagePublisher;
    private final ItemServiceClient itemServiceClient;
    private final TransactionMapper transactionMapper;

    private static final String ADMIN = "SYSTEM";

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> createTransaction(CreateTransactionRequest request, String userId) {
        if (transactionRepository.hasActiveTransactionForItem(request.getItemId(), userId)){
            log.warn("User {} already has an active transaction for item {}", userId, request.getItemId());
            throw new InvalidDataException("An active transaction already exists for this item.");
        }

        ApiResponse<ItemResponse> response = itemServiceClient.getItemById(request.getItemId());

        ItemResponse item;
        try {
            item = response.getData();
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

        String itemImageUrl = (item.getImages() != null && !item.getImages().isEmpty())
                ? item.getImages().get(0)
                : null;

        Long totalAmount = item.getPrice() * request.getQuantity();

        Transaction transaction = Transaction.builder()
                .itemId(request.getItemId())
                .itemTitle(item.getTitle())
                .itemImageUrl(itemImageUrl)
                .itemPrice(item.getPrice())
                .buyerId(userId)
                .sellerId(item.getUserId())
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
        log.info("Transaction {} created in database", transaction.getId());

        publishTransactionEvent(transaction, EventType.CREATED, "Transaction created and pending payment.");

        return ApiResponse.<TransactionResponse>builder()
                .status(CREATED.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Transaction created successfully.")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> completeTransaction(String userId, String transactionId) {
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

        publishTransactionEvent(transaction, EventType.COMPLETED, "Transaction completed successfully.");
        publishTransactionUpdate(transaction, oldStatus, "Transaction completed");

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getSellerId())
                .title("Transaction Completed")
                .message("The transaction for your item '" + transaction.getItemTitle() + "' has been completed by the buyer.")
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
    @Transactional
    public ApiResponse<TransactionResponse> cancelTransaction(String userId, String transactionId, String reason) {
        Transaction transaction = getTransactionIfExists(transactionId);

         boolean isBuyer = transaction.getBuyerId().equals(userId);
        boolean isSeller = transaction.getSellerId().equals(userId);
        boolean isSystem = userId.equals(ADMIN);

        if (!isBuyer && !isSeller && !isSystem){
            log.error("User {} is not authorized to update transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to update this transaction.");
        }

        if (transaction.getStatus() == TransactionStatus.COMPLETED || transaction.getStatus() == TransactionStatus.CANCELLED){
            log.error("Transaction {} cannot be updated as it is already {}", transactionId, transaction.getStatus());
            throw new InvalidDataException("Transaction cannot be updated in its current status.");
        }

        TransactionStatus oldStatus = transaction.getStatus();

        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction.setCancelledBy(userId);
        transaction.setCancelledAt(LocalDateTime.now());
        transaction.setReason(reason);
        transaction = transactionRepository.save(transaction);
        log.info("Transaction {} cancelled successfully by user {}", transactionId, userId);

        if (oldStatus == TransactionStatus.PENDING) {
             publishTransactionEvent(transaction, EventType.CANCELLED, "Transaction has been cancelled. Reason: " + reason);
        }

        publishTransactionUpdate(transaction, oldStatus, "Transaction cancelled.");

        if (!isSystem) {
             NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(isBuyer ? transaction.getSellerId() : transaction.getBuyerId())
                .title("Transaction Cancelled")
                .message("The transaction for item '" + transaction.getItemTitle() + "' has been cancelled. Reason: " + reason)
                .type(EventType.CANCELLED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();
            messagePublisher.publishNotification(notification);
        }

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Method not implemented yet.")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> updateTransactionStatus(String userId, String transactionId, TransactionStatus status) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getSellerId().equals(userId)){
            log.error("User {} is not authorized to update status for transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to update this transaction's status.");
        }

        TransactionStatus oldStatus = transaction.getStatus();

        if (status == TransactionStatus.DELIVERY){
            transaction.setShippedAt(LocalDateTime.now());
        }

        transaction.setStatus(status);
        transaction = transactionRepository.save(transaction);
        log.info("Transaction {} status updated to {} by user {}", transactionId, status, userId);

        publishTransactionEvent(transaction, EventType.UPDATED, "Transaction status updated to " + status);
        publishTransactionUpdate(transaction, oldStatus, "Transaction status updated to " + status);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getBuyerId())
                .title("Transaction Status Updated")
                .message("The status of your transaction for item '" + transaction.getItemTitle() + "' has been updated to " + status + ".")
                .type(EventType.UPDATED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Update transaction status successfully.")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> confirmDelivery(String userId, String transactionId, String trackingCode) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getSellerId().equals(userId)){
            log.error("User {} is not authorized to confirm delivery for transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to confirm delivery for this transaction.");
        }

        TransactionStatus oldStatus = transaction.getStatus();
        transaction.setStatus(TransactionStatus.DELIVERY);
        transaction.setDeliveryTrackingCode(trackingCode);
        transaction.setShippedAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);
        log.info("Transaction {} delivery confirmed by user {}", transactionId, userId);

        publishTransactionEvent(transaction, EventType.UPDATED, "Delivery confirmed for transaction.");
        publishTransactionUpdate(transaction, oldStatus, "Delivery confirmed.");

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getSellerId())
                .title("Delivery Confirmed")
                .message("The buyer has confirmed delivery for your item '" + transaction.getItemTitle() + "'.")
                .type(EventType.UPDATED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Delivery confirmed successfully.")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TransactionResponse> submitFeedback(String userId, String transactionId, String comment, Double rating) {
        Transaction transaction = getTransactionIfExists(transactionId);

        if (!transaction.getBuyerId().equals(userId)){
            log.error("User {} is not authorized to submit feedback for transaction {}", userId, transactionId);
            throw new InvalidDataException("You are not authorized to submit feedback for this transaction.");
        }

        if (transaction.getStatus() != TransactionStatus.COMPLETED){
            log.error("Transaction {} is not completed. Current status: {}", transactionId, transaction.getStatus());
            throw new InvalidDataException("Feedback can only be submitted for completed transactions.");
        }

        if (transaction.isFeedbackSumitted()){
            log.error("Feedback for transaction {} has already been submitted", transactionId);
            throw new InvalidDataException("Feedback has already been submitted for this transaction.");
        }

        transaction.setFeedbackSumitted(true);
        transactionRepository.save(transaction);

        log.info("Feedback for transaction {} submitted by user {}", transactionId, userId);

        FeedbackEvent event = FeedbackEvent.builder()
                .transactionId(transaction.getId())
                .itemId(transaction.getItemId())
                .reviewerId(transaction.getSellerId())
                .rating(rating)
                .comment(comment)
                .build();

        messagePublisher.publishFeedbackEvent(event);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(transaction.getSellerId())
                .title("New Feedback Received")
                .message("You have received new feedback for your item '" + transaction.getItemTitle() + "'.")
                .type(EventType.FEEDBACK_SUBMITTED)
                .itemId(transaction.getItemId())
                .transactionId(transaction.getId())
                .build();

        messagePublisher.publishNotification(notification);

        return ApiResponse.<TransactionResponse>builder()
                .status(OK.value())
                .data(transactionMapper.toResponse(transaction))
                .message("Feedback submitted successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByBuyerId(String userId, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findByBuyerIdOrderByCreatedAtDesc(userId, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by buyer ID successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionBySellerId(String userId, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findBySellerIdOrderByCreatedAtDesc(userId, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by seller ID successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByUserId(String userId, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findByUserId(userId, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by user ID successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByStatus(String userId, TransactionStatus status, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by status and userId successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByType(String userId, TransactionType type, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by type and userId successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getPendingTransactionsForSeller(String userId, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findByUserIdAndStatus(userId, TransactionStatus.PENDING, pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get pending transactions for seller successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<TransactionResponse>> getAllTransactions(int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);

        Page<Transaction> transaction = transactionRepository.findAllPage(pageable);

        Page<TransactionResponse> responses = transaction.map(transactionMapper::toResponse);

        PageResponse<TransactionResponse> pageResponse = createPageResponse(responses);

        return ApiResponse.<PageResponse<TransactionResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Get transactions by user ID successfully.")
                .build();
    }

    @Override
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void processExpiredTransaction() {
        List<TransactionStatus> explorableStatuses = List.of(TransactionStatus.PENDING);

        List<Transaction> expiredTransactions = transactionRepository.findByStatusInAndExpiresAtBefore(explorableStatuses, LocalDateTime.now());

        if (expiredTransactions.isEmpty()) {
            log.info("No expired transactions found to process.");
            return;
        }

        for (Transaction transaction : expiredTransactions) {
            try {
                cancelTransaction(ADMIN, transaction.getId(), "Transaction expired due to non-payment.");
                log.info("Expired transaction {} has been cancelled by system.", transaction.getId());
            } catch (Exception e) {
                log.error("Failed to cancel expired transaction {}: {}", transaction.getId(), e.getMessage());
            }
            log.info("Expired transaction {} has been cancelled.", transaction.getId());
        }
    }

    @Override
    @Transactional
    public void processPaymentResult(PaymentEvent event) {
        if (event.getLinkedTransactionId() == null){
            log.error("Payment event {} does not have a linked transaction ID.", event.getEventId());
            return;
        }

        String transactionId = event.getLinkedTransactionId();
        Transaction transaction = getTransactionIfExists(transactionId);

        if (event.getMessage() != null) {
            log.warn("SAGA: Received PAYMENT_FAILED event for transaction {}. Reason: {}",
                     transactionId, event.getMessage());

            if (transaction.getStatus() == TransactionStatus.PAYMENT_PENDING) {
                cancelTransaction(ADMIN, transactionId, "Payment failed: " + event.getMessage());
            }
            return;
        }

        log.info("SAGA: Received PAYMENT_COMPLETED event for transaction {}", transactionId);
        if (transaction.getStatus() == TransactionStatus.PENDING) {
            transaction.setStatus(TransactionStatus.PAYMENT_PENDING);
            transaction = transactionRepository.save(transaction);

            NotificationMessage notification = NotificationMessage.builder()
                    .notificationId(UUID.randomUUID().toString())
                    .recipientUserId(transaction.getSellerId())
                    .title("Payment Received!")
                    .message("Payment for item '" + transaction.getItemTitle() + "' has been received. Please prepare for delivery.")
                    .type(EventType.UPDATED)
                    .itemId(transaction.getItemId())
                    .transactionId(transaction.getId())
                    .build();
            messagePublisher.publishNotification(notification);
        }
    }

    @Override
    public ApiResponse<TransactionStatisticsResponse> getTransactionStatistics() {
        List<Object[]> results = transactionRepository.countTransactionsByStatus();
        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            stats.put(result[0].toString(), (Long) result[1]);
        }
        return ApiResponse.<TransactionStatisticsResponse>builder()
                .status(OK.value())
                .data(TransactionStatisticsResponse.builder()
                        .totalTransactions(results.stream().mapToLong(value -> (Long) value[1]).sum())
                        .transactionStats(stats)
                        .build())
                .message("Get transaction statistics successfully.")
                .build();
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

    private Pageable createPageable(int pageNo, int pageSize, String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "createdAt");
        return PageRequest.of(pageNo, pageSize, sort);
    }

    private <T> PageResponse<T> createPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
