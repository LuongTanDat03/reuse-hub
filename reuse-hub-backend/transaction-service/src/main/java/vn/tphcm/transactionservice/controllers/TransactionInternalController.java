/*
 * @ (#) TransactionInternalController.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.request.UpdateTransactionStatusRequest;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.services.TransactionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/transactions")
@Hidden
@Slf4j(topic = "TRANSACTION-INTERNAL-CONTROLLER")
public class TransactionInternalController {
    private final TransactionService transactionService;

    @PutMapping("/{transactionId}/status")
    public ApiResponse<TransactionResponse> updateTransactionStatus(
            @PathVariable String transactionId,
            @RequestBody UpdateTransactionStatusRequest request) {


        log.info("Internal request received to update transaction {} status to {}", transactionId, request.getStatus());
        return transactionService.updateTransactionStatus(
                "SYSTEM_ADMIN",
                transactionId,
                request.getStatus()
        );
    }
}
