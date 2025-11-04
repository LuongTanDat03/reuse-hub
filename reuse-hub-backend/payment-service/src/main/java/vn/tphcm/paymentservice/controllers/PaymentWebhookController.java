/*
 * @ (#) PaymentWebhookController.java       1.0     11/4/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.controllers;

import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.paymentservice.dtos.ApiResponse;
import vn.tphcm.paymentservice.exceptions.InvalidDataException;
import vn.tphcm.paymentservice.services.PaymentService;

import static org.springframework.http.HttpStatus.*;

/*
 * @author: Luong Tan Dat
 * @date: 11/4/2025
 */

@RestController
@RequestMapping("/payments/stripe")
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-WEBHOOK-CONTROLLER")
@Hidden
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ApiResponse<String> handleStripeWebhook(@RequestBody String payload,
                                                    @RequestHeader("Stripe-Signature") String sigHeader) {

        log.info("Received Stripe Webhook call...");

        try {
            paymentService.handleStripeWebhook(payload, sigHeader);
            return ApiResponse.<String>builder()
                    .status(OK.value())
                    .message("Webhook processed successfully")
                    .build();
        } catch (InvalidDataException e) {
            log.warn("Webhook processing failed (400): {}", e.getMessage());
            return  ApiResponse.<String>builder()
                    .status(BAD_REQUEST.value())
                    .message("Invalid webhook data: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Webhook processing failed (500): {}", e.getMessage(), e);
            return  ApiResponse.<String>builder()
                    .status(INTERNAL_SERVER_ERROR.value())
                    .message("Internal server error")
                    .build();
        }
    }
}
