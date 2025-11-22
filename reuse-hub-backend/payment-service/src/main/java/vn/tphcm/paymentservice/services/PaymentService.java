/*
 * @ (#) PaymentService.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.services;

import com.stripe.exception.StripeException;
import vn.tphcm.paymentservice.dtos.ApiResponse;
import vn.tphcm.paymentservice.dtos.request.CreatePaymentRequest;
import vn.tphcm.paymentservice.dtos.response.PaymentResponse;

/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */
public interface PaymentService {
    ApiResponse<PaymentResponse> createPaymentIntent(CreatePaymentRequest request, String userId) throws StripeException;

    void handleStripeWebhook(String payload, String sigHeader);

    ApiResponse<PaymentResponse> getPaymentById(String paymentId, String userId);

    ApiResponse<PaymentResponse> getPaymentByTransactionId(String transactionId, String userId);
}
