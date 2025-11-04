/*
 * @ (#) PaymentServiceImpl.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.paymentservice.commons.PaymentStatus;
import vn.tphcm.paymentservice.dtos.ApiResponse;
import vn.tphcm.paymentservice.dtos.request.CreatePaymentRequest;
import vn.tphcm.paymentservice.dtos.response.PaymentResponse;
import vn.tphcm.paymentservice.exceptions.InvalidDataException;
import vn.tphcm.paymentservice.exceptions.ResourceNotFoundException;
import vn.tphcm.paymentservice.models.Payment;
import vn.tphcm.paymentservice.repositories.PaymentRepository;
import vn.tphcm.paymentservice.services.MessageProducer;
import vn.tphcm.paymentservice.services.PaymentService;

import java.util.UUID;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-SERVICE")
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final MessageProducer messageProducer;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("Stripe API key initialized.");
    }

    @Override
    @Transactional
    public ApiResponse<PaymentResponse> createPaymentIntent(CreatePaymentRequest request, String userId) throws StripeException {
        log.info("Creating payment intent for user: {}", userId);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount())
                .setCurrency(request.getCurrency())
                .setDescription(request.getDescription())
                .putMetadata("userId", userId)
                .putMetadata("linked_item_id", request.getLinkedItemId())
                .putMetadata("linked_transaction_id", request.getLinkedTransactionId())
                .addPaymentMethodType(request.getPaymentMethod().toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        log.info("Payment intent created with ID: {}", paymentIntent.getId());

        Payment payment = Payment.builder()
                .userId(userId)
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .description(request.getDescription())
                .linkedItemId(request.getLinkedItemId())
                .linkedTransactionId(request.getLinkedTransactionId())
                .paymentMethod(request.getPaymentMethod())
                .stripePaymentIntentId(paymentIntent.getId())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment record saved with ID: {}", payment.getId());

        return ApiResponse.<PaymentResponse>builder()
                .status(OK.value())
                .data(
                        PaymentResponse.builder()
                                .clientSecret(paymentIntent.getClientSecret())
                                .paymentId(payment.getId())
                                .build()
                )
                .message("Payment intent created successfully.")
                .build();
    }

    @Override
    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) {
       Event event;
        try {
            // Create payload
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook Error: Invalid Stripe signature.", e);
            throw new InvalidDataException("Invalid Stripe signature.");
        } catch (Exception e) {
            log.error("Webhook Error: Failed to construct event.", e);
            throw new InvalidDataException("Error processing webhook payload.");
        }

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            log.warn("Webhook event data object is empty. Event type: {}", event.getType());
            return;
        }

        log.info("Received Stripe Webhook Event: type={}", event.getType());
        PaymentIntent paymentIntent;
        switch (event.getType()) {
            case "payment_intent.succeeded":
                paymentIntent = (PaymentIntent) stripeObject;
                log.info("Payment Succeeded for PaymentIntent: {}", paymentIntent.getId());
                this.processPaymentSucceeded(paymentIntent);
                break;
            case "payment_intent.payment_failed":
                paymentIntent = (PaymentIntent) stripeObject;
                log.warn("Payment Failed for PaymentIntent: {}. Reason: {}", paymentIntent.getId(), paymentIntent.getLastPaymentError().getMessage());
                this.processPaymentFailed(paymentIntent);
                break;
            default:
                log.warn("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private void processPaymentSucceeded(PaymentIntent paymentIntent) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Stripe Intent ID: " + paymentIntent.getId()));

        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            log.warn("Payment {} was already marked as SUCCEEDED. Webhook duplicate.", payment.getId());
            return;
        }

        payment.setStatus(PaymentStatus.SUCCEEDED);
        paymentRepository.save(payment);

        PaymentEvent sagaEvent = PaymentEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentId(payment.getId())
                .userId(payment.getUserId())
                .linkedItemId(payment.getLinkedItemId())
                .linkedTransactionId(payment.getLinkedTransactionId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .build();
        messageProducer.publishPaymentCompletedEvent(sagaEvent);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(payment.getUserId())
                .title("Payment Successful")
                .message("Your payment for '" + payment.getDescription() + "' was successful.")
                .type("PAYMENT_SUCCEEDED")
                .build();
        messageProducer.publishNotification(notification);
    }

    private void processPaymentFailed(PaymentIntent paymentIntent) {
         Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Stripe Intent ID: " + paymentIntent.getId()));

        if (payment.getStatus() == PaymentStatus.FAILED) {
            log.warn("Payment {} was already marked as FAILED. Webhook duplicate.", payment.getId());
            return;
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);


        PaymentEvent sagaEvent = PaymentEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .paymentId(payment.getId())
                .userId(payment.getUserId())
                .linkedItemId(payment.getLinkedItemId())
                .linkedTransactionId(payment.getLinkedTransactionId())
                .message(paymentIntent.getLastPaymentError().getMessage())
                .build();
        messageProducer.publishPaymentFailedEvent(sagaEvent);

         NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientUserId(payment.getUserId())
                .title("Payment Failed")
                .message("Your payment for '" + payment.getDescription() + "' failed. Please try again.")
                .type("PAYMENT_FAILED")
                .build();
        messageProducer.publishNotification(notification);
    }
}
