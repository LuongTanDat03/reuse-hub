/*
 * @ (#) TransactionService.java       1.0     10/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 10/22/2025
 */


import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.PageResponse;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;

@Service
public interface TransactionService {
    ApiResponse<TransactionResponse> createTransaction(CreateTransactionRequest request, String userId);

    ApiResponse<TransactionResponse> completeTransaction(String userId, String transactionId);

    ApiResponse<TransactionResponse> cancelTransaction(String userId, String transactionId, String reason);

    ApiResponse<TransactionResponse> updateTransactionStatus(String userId, String transactionId, TransactionStatus status);

    ApiResponse<TransactionResponse> confirmDelivery(String userId, String transactionId, String trackingCode);

    ApiResponse<TransactionResponse> submitFeedback(String userId, String transactionId, String comment, Double rating);

    ApiResponse<PageResponse<TransactionResponse>> getTransactionByBuyerId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<PageResponse<TransactionResponse>> getTransactionBySellerId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<PageResponse<TransactionResponse>> getTransactionByUserId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<PageResponse<TransactionResponse>> getTransactionByStatus(String userId, TransactionStatus status, int page, int size, String sortBy, String sortDirection);

    ApiResponse<PageResponse<TransactionResponse>> getTransactionByType(String userId, TransactionType type, int page, int size, String sortBy, String sortDirection);

    ApiResponse<PageResponse<TransactionResponse>> getPendingTransactionsForSeller(String userId, int page, int size, String sortBy, String sortDirection);

    void processExpiredTransaction();

    void processPaymentResult(PaymentEvent event);
}
