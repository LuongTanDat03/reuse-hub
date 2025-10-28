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


import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;

import java.util.List;

@Service
public interface TransactionService {
    ApiResponse<TransactionResponse> createTransaction(CreateTransactionRequest request, String userId);

    ApiResponse<TransactionResponse> completeTransaction(String userId, String transactionId, TransactionStatus status);

    ApiResponse<TransactionResponse> cancelTransaction(String userId, String transactionId, String reason);

    ApiResponse<TransactionResponse> updateTransactionStatus(String userId, String transactionId, TransactionStatus status);

    ApiResponse<TransactionResponse> confirmDelivery(String userId, String transactionId, String trackingCode);

    ApiResponse<TransactionResponse> submitFeedback(String userId, String transactionId, String comment, Double rating);

    ApiResponse<Page<TransactionResponse>> getTransactionByBuyerId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getTransactionBySellerId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getTransactionByUserId(String userId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getTransactionByStatus(String userId, TransactionStatus status, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getTransactionByType(String userId, TransactionType type, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getTransactionByItemId(String userId, String itemId, int page, int size, String sortBy, String sortDirection);

    ApiResponse<Page<TransactionResponse>> getPendingTransactionsForSeller(String userId, int page, int size, String sortBy, String sortDirection);

    void processExpiredTransaction();
}
