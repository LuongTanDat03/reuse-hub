/*
 * @ (#) PaymentController.java       1.0     11/4/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/4/2025
 */

import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.paymentservice.dtos.ApiResponse;
import vn.tphcm.paymentservice.dtos.request.CreatePaymentRequest;
import vn.tphcm.paymentservice.dtos.response.PaymentResponse;
import vn.tphcm.paymentservice.services.PaymentService;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
@Slf4j(topic = "PAYMENT-SERVICE")
public class PaymentController {

    private final PaymentService paymentService;

    private String getUserIdFromHeader(String userId) {
        if (userId == null || userId.isBlank()) {
            log.error("Missing X-User-Id header in payment request");
            throw new SecurityException("User ID not found in request header");
        }
        return userId;
    }

    @PostMapping("/create-intent")
    @Operation(summary = "Create a new Payment Intent",
            description = "Called by the client (web/app) to initialize a payment with Stripe. " +
                    "Returns a clientSecret to be used with Stripe.js on the frontend.")
    public ApiResponse<PaymentResponse> createPaymentIntent(@RequestHeader("X-User-Id") String userIdHeader,
                                                            @RequestBody CreatePaymentRequest request) {

        String userId = getUserIdFromHeader(userIdHeader);
        log.info("User {} is creating a payment intent for amount {}", userId, request.getAmount());

        try {
            return paymentService.createPaymentIntent(request, userId);

        } catch (StripeException e) {
            log.error("Stripe API error while creating PaymentIntent for user {}: {}", userId, e.getMessage());
            return ApiResponse.<PaymentResponse>builder()
                    .status(BAD_REQUEST.value())
                    .message("Error creating payment: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Internal error while creating PaymentIntent for user {}: {}", userId, e.getMessage(), e);
            return ApiResponse.<PaymentResponse>builder()
                    .status(INTERNAL_SERVER_ERROR.value())
                    .message("An internal error occurred.")
                    .build();
        }
    }
}
