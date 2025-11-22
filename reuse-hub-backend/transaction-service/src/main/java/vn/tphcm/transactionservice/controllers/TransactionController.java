/*
 * @ (#) TransactionController.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.PageResponse;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.request.SubmitRatingRequest;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.services.TransactionService;

import java.nio.file.AccessDeniedException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transactions")
@Slf4j(topic = "TRANSACTION-CONTROLLER")
public class TransactionController {
    private final TransactionService transactionService;

    private String getUserIdFromHeader(String userId) throws AccessDeniedException {
        if (userId == null || userId.isBlank()) {
            log.error("Missing X-User-Id header");
            throw new AccessDeniedException("User ID not found in request header");
        }
        return userId;
    }

    @PostMapping
    @Operation(summary = "Create a new transaction (SAGA)",
            description = "Buyer requests an item. This starts the SAGA.")
    public ApiResponse<TransactionResponse> createTransaction(@RequestHeader("X-User-Id") String userIdHeader,
                                                              @RequestBody CreateTransactionRequest request) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to CREATE transaction for item {} from user {}", request.getItemId(), userId);
        return transactionService.createTransaction(request, userId);
    }

    @PostMapping("/{transactionId}/confirm-delivery")
    @Operation(summary = "Confirm item delivery (Seller)",
            description = "Seller confirms they have shipped the item and provides a tracking code.")
    public ApiResponse<TransactionResponse> confirmDelivery(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable String transactionId,
            @RequestBody String trackingCode) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to CONFIRM DELIVERY for transaction {} from user {}", transactionId, userId);
        return transactionService.confirmDelivery(userId, transactionId, trackingCode);
    }

    @PostMapping("/{transactionId}/complete")
    @Operation(summary = "Complete transaction (Buyer)",
            description = "Buyer confirms they have received the item. This starts the COMPLETED SAGA.")
    public ApiResponse<TransactionResponse> completeTransaction(@RequestHeader("X-User-Id") String userIdHeader,
                                                                @PathVariable String transactionId) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to COMPLETE transaction {} from user {}", transactionId, userId);
        return transactionService.completeTransaction(userId, transactionId);
    }

    @PostMapping("/{transactionId}/cancel")
    @Operation(summary = "Cancel transaction (Buyer or Seller)",
            description = "Buyer or Seller cancels the transaction. This starts the CANCELLED SAGA.")
    public ApiResponse<TransactionResponse> cancelTransaction(@RequestHeader("X-User-Id") String userIdHeader,
                                                              @PathVariable String transactionId,
                                                              @RequestBody String reason) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to CANCEL transaction {} from user {}. Reason: {}", transactionId, userId, reason);
        return transactionService.cancelTransaction(userId, transactionId, reason);
    }

    @PostMapping("/{transactionId}/feedback")
    @Operation(summary = "Submit feedback (Buyer)",
            description = "Buyer submits rating and comment after transaction completion. This publishes a FEEDBACK SAGA event.")
    public ApiResponse<TransactionResponse> submitFeedback(@RequestHeader("X-User-Id") String userIdHeader,
                                                           @PathVariable String transactionId,
                                                           @RequestBody SubmitRatingRequest request) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to SUBMIT FEEDBACK for transaction {} from user {}", transactionId, userId);
        return transactionService.submitFeedback(userId, transactionId, request.getComment(), request.getRating());
    }

    @PutMapping("/{transactionId}/status")
    @Operation(summary = "Update transaction status (Admin)", description = "Admin updates the status of a transaction.")
    public ApiResponse<TransactionResponse> updateTransactionStatus(@RequestHeader("X-User-Id") String userIdHeader,
                                                                    @PathVariable String transactionId,
                                                                    @RequestBody TransactionStatus status) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to UPDATE STATUS for transaction {} from user {}. New status: {}", transactionId, userId, status);

        return transactionService.updateTransactionStatus(userId, transactionId, status);
    }

    @GetMapping("/buyer")
    @Operation(summary = "Get transactions by Buyer ID", description = "Retrieve paginated transactions for a specific buyer.")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByBuyerId(@RequestHeader("X-User-Id") String userIdHeader,
                                                                                  @RequestParam int page,
                                                                                  @RequestParam int size,
                                                                                  @RequestParam String sortBy,
                                                                                  @RequestParam String sortDirection) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET transactions for BUYER {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, page, size, sortBy, sortDirection);

        return transactionService.getTransactionByBuyerId(userId, page, size, sortBy, sortDirection);
    }

    @GetMapping("/seller")
    @Operation(summary = "Get transactions by Seller ID", description = "Retrieve paginated transactions for a specific seller.")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionBySellerId(@RequestHeader("X-User-Id") String userIdHeader,
                                                                                   @RequestParam int page,
                                                                                   @RequestParam int size,
                                                                                   @RequestParam String sortBy,
                                                                                   @RequestParam String sortDirection) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET transactions for SELLER {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, page, size, sortBy, sortDirection);

        return transactionService.getTransactionBySellerId(userId, page, size, sortBy, sortDirection);
    }

    @GetMapping("/user")
    @Operation(summary = "Get transactions by User ID", description = "Retrieve paginated transactions for a specific user (buyer or seller).")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByUserId(@RequestHeader("X-User-Id") String userIdHeader,
                                                                                 @RequestParam int page,
                                                                                 @RequestParam int size,
                                                                                 @RequestParam String sortBy,
                                                                                 @RequestParam String sortDirection) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET transactions for USER {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, page, size, sortBy, sortDirection);

        return transactionService.getTransactionByUserId(userId, page, size, sortBy, sortDirection);
    }


    @GetMapping("/seller/pending")
    @Operation(summary = "Get pending transactions for Seller", description = "Retrieve paginated pending")
    public ApiResponse<PageResponse<TransactionResponse>> getPendingTransactionsForSeller(@RequestHeader("X-User-Id") String userIdHeader,
                                                                                          @RequestParam int page,
                                                                                          @RequestParam int size,
                                                                                          @RequestParam String sortBy,
                                                                                          @RequestParam String sortDirection) throws AccessDeniedException {
        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET PENDING transactions for SELLER {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, page, size, sortBy, sortDirection);

        return transactionService.getPendingTransactionsForSeller(userId, page, size, sortBy, sortDirection);
    }

    @GetMapping("/status")
    @Operation(summary = "Get transactions by Status", description = "Retrieve paginated transactions for a specific status.")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByStatus(@RequestHeader("X-User-Id") String userIdHeader,
                                                                                 @RequestParam TransactionStatus status,
                                                                                 @RequestParam int page,
                                                                                 @RequestParam int size,
                                                                                 @RequestParam String sortBy,
                                                                                 @RequestParam String sortDirection) throws AccessDeniedException {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET transactions for USER {} with STATUS {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, status, page, size, sortBy, sortDirection);

        return transactionService.getTransactionByStatus(userId, status, page, size, sortBy, sortDirection);
    }

    @GetMapping("/type")
    @Operation(summary = "Get transactions by Type", description = "Retrieve paginated transactions for a specific type.")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactionByType(@RequestHeader("X-User-Id") String userIdHeader,
                                                                               @RequestParam TransactionType type,
                                                                               @RequestParam int page,
                                                                               @RequestParam int size,
                                                                               @RequestParam String sortBy,
                                                                               @RequestParam String sortDirection) throws AccessDeniedException {
        String userId = getUserIdFromHeader(userIdHeader);
        log.info("Request received to GET transactions for USER {} with TYPE {}. Page: {}, Size: {}, SortBy: {}, SortDirection: {}",
                userId, type, page, size, sortBy, sortDirection);
        return transactionService.getTransactionByType(userId, type, page, size, sortBy, sortDirection);
    }

}
