/*
 * @ (#) TransactionFeignController.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.PageResponse;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.dtos.response.TransactionStatisticsResponse;
import vn.tphcm.transactionservice.services.TransactionService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "TRANSACTION-FEIGN-CONTROLLER")
@RequestMapping("/transaction-feign")
public class TransactionFeignController {
    private final TransactionService transactionService;

    @GetMapping
    public ApiResponse<PageResponse<TransactionResponse>> getAllTransactions(@RequestParam(defaultValue = "0") int pageNo,
                                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                              @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Feign client request to get all transactions");

        return transactionService.getAllTransactions(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/statistics")
    public ApiResponse<TransactionStatisticsResponse> getTransactionStatistics() {
        log.info("Feign client request to get transaction statistics");

        return transactionService.getTransactionStatistics();
    }
}
