/*
 * @ (#) AdminServiceImpl.java       1.0     11/25/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/25/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import vn.tphcm.adminservice.clients.ItemClient;
import vn.tphcm.adminservice.clients.TransactionClient;
import vn.tphcm.adminservice.clients.UserClient;
import vn.tphcm.adminservice.commons.UserStatus;
import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.PageResponse;
import vn.tphcm.adminservice.dto.response.*;
import vn.tphcm.adminservice.services.AdminService;

import java.security.SecureRandom;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "ADMIN-SERVICE")
public class AdminServiceImpl implements AdminService {
    private final UserClient userClient;
    private final TransactionClient transactionClient;
    private final ItemClient itemClient;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!";
    private static final int CODE_LENGTH = 10;

    @Qualifier("adminTaskExecutor")
    private final Executor executor;

    @Override
    public ApiResponse<DashboardUserResponse> getAllUsers(int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("AdminServiceImpl - getAllUsers: Start fetching all users with pageNo={}, pageSize={}, sortBy={}, sortDirection={}",
                pageNo, pageSize, sortBy, sortDirection);

        long startTime = System.currentTimeMillis();

        CompletableFuture<PageResponse<InfoUserResponse>> userFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getAllUsers", Thread.currentThread().getName());
            return userClient.getAllUsers(pageNo, pageSize, sortBy, sortDirection).getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching users: {}", ex.getMessage());
            return null;
        });

        CompletableFuture<UserStatisticsResponse> statsFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getUserStatistics", Thread.currentThread().getName());
            return userClient.getUserStatistics().getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching stats: {}", ex.getMessage());
            return null;
        });

        CompletableFuture.allOf(userFuture, statsFuture).join();

        long endTime = System.currentTimeMillis();
        log.info("All tasks user completed in {} ms", (endTime - startTime));

        return ApiResponse.<DashboardUserResponse>builder()
                .status(OK.value())
                .message("Fetched users and statistics successfully")
                .data(DashboardUserResponse.builder()
                        .users(userFuture.join())
                        .statistics(statsFuture.join())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<DashboardItemResponse> getAllItems(int pageNo, int pageSize, String sortBy, String sortDirection, String filter, String categorySlug) {
        log.info("AdminServiceImpl - getAllItems: Start fetching all items with pageNo={}, pageSize={}, sortBy={}, sortDirection={}, filter={}, categorySlug={}",
                pageNo, pageSize, sortBy, sortDirection, filter, categorySlug);

        long startTime = System.currentTimeMillis();

        CompletableFuture<PageResponse<ItemResponse>> itemFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getAllItems with filter={}, categorySlug={}", Thread.currentThread().getName(), filter, categorySlug);
            return itemClient.getAllItems(pageNo, pageSize, sortBy, sortDirection, filter, categorySlug).getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching items: {}", ex.getMessage());
            return null;
        });

        CompletableFuture<ItemStatisticsResponse> statsFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getItemStatistics", Thread.currentThread().getName());
            return itemClient.getItemStatistics().getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching items stats: {}", ex.getMessage());
            return null;
        });

        CompletableFuture.allOf(itemFuture, statsFuture).join();

        long endTime = System.currentTimeMillis();
        log.info("All tasks items completed in {} ms", (endTime - startTime));

        return ApiResponse.<DashboardItemResponse>builder()
                .status(OK.value())
                .message("Fetched items and statistics successfully")
                .data(DashboardItemResponse.builder()
                        .items(itemFuture.join())
                        .statistics(statsFuture.join())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<DashboardTransactionResponse> getAllTransactions(int pageNo, int pageSize, String sortBy, String sortDirection) {
        log.info("AdminServiceImpl - getAllTransaction: Start fetching all transaction with pageNo={}, pageSize={}, sortBy={}, sortDirection={}",
                pageNo, pageSize, sortBy, sortDirection);

        long startTime = System.currentTimeMillis();

        CompletableFuture<PageResponse<TransactionResponse>> transactionFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getAllTransactions", Thread.currentThread().getName());
            return transactionClient.getAllTransactions(pageNo, pageSize, sortBy, sortDirection).getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching transaction: {}", ex.getMessage());
            return null;
        });

        CompletableFuture<TransactionStatisticsResponse> statsFuture = CompletableFuture.supplyAsync(() -> {
            log.info("Thread {}: Bắt đầu gọi getTransactionStatistics", Thread.currentThread().getName());
            return transactionClient.getTransactionStatistics().getData();
        }, executor).exceptionally(ex -> {
            log.error("Error fetching transactions stats: {}", ex.getMessage());
            return null;
        });

        CompletableFuture.allOf(transactionFuture, statsFuture).join();

        long endTime = System.currentTimeMillis();
        log.info("All tasks transactions completed in {} ms", (endTime - startTime));

        return ApiResponse.<DashboardTransactionResponse>builder()
                .status(OK.value())
                .message("Fetched transactions and statistics successfully")
                .data(DashboardTransactionResponse.builder()
                        .transactions(transactionFuture.join())
                        .statistics(statsFuture.join())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<Void> disableUser(String userId) {
        log.info("AdminServiceImpl - disableUser: Start disabling user with userId={}", userId);

        return userClient.updateUserStatus(userId, UserStatus.DELETED);
    }

    @Override
    public ApiResponse<Void> enableUser(String userId) {
        log.info("AdminServiceImpl - enableUser: Start disabling user with userId={}", userId);

        return userClient.updateUserStatus(userId, UserStatus.ACTIVE);
    }

    @Override
    public ApiResponse<Void> resetPassword(String userId) {
        log.info("AdminServiceImpl - resetPassword: Start resetting password for user with userId={}", userId);

        return userClient.resetPassword(userId, generateCode());
    }

    @Override
    public ApiResponse<Void> deleteItem(String itemId) {
        log.info("AdminServiceImpl - deleteItem: Start deleting item with itemId={}", itemId);

        return itemClient.deleteItem(itemId);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        return code.toString();
    }
}
