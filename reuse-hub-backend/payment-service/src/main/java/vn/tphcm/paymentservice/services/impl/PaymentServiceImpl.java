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
import vn.tphcm.paymentservice.mappers.PaymentMapper;
import vn.tphcm.paymentservice.models.Payment;
import vn.tphcm.paymentservice.models.WebhookEvent;
import vn.tphcm.paymentservice.repositories.PaymentRepository;
import vn.tphcm.paymentservice.repositories.WebhookEventRepository;
import vn.tphcm.paymentservice.services.MessageProducer;
import vn.tphcm.paymentservice.services.PaymentService;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "PAYMENT-SERVICE")
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final MessageProducer messageProducer;
    private final PaymentMapper paymentMapper;
    private final WebhookEventRepository webhookEventRepository;

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

        // Check if payment already exists for this transaction
        if (request.getLinkedTransactionId() != null) {
            var existingPayment = paymentRepository.findFirstByLinkedTransactionIdOrderByCreatedAtDesc(request.getLinkedTransactionId());
            if (existingPayment.isPresent()) {
                Payment payment = existingPayment.get();
                log.info("Payment already exists for transaction {}: {}", request.getLinkedTransactionId(), payment.getId());

                if (payment.getStatus() == PaymentStatus.PENDING) {
                    try {
                        PaymentIntent existingIntent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
                        log.info("Returning existing payment intent for transaction {}", request.getLinkedTransactionId());
                        return ApiResponse.<PaymentResponse>builder()
                                .status(OK.value())
                                .data(PaymentResponse.builder()
                                        .clientSecret(existingIntent.getClientSecret())
                                        .paymentId(payment.getId())
                                        .build())
                                .message("Existing payment intent retrieved.")
                                .build();
                    } catch (StripeException e) {
                        log.warn("Could not retrieve existing payment intent, creating new one: {}", e.getMessage());
                    }
                } else if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
                    log.warn("Payment for transaction {} already succeeded. Payment ID: {}", request.getLinkedTransactionId(), payment.getId());
                    return ApiResponse.<PaymentResponse>builder()
                            .status(OK.value())
                            .data(PaymentResponse.builder()
                                    .clientSecret(null)
                                    .paymentId(payment.getId())
                                    .build())
                            .message("Payment already completed.")
                            .build();
                }
            }
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount())
                .setCurrency(request.getCurrency())
                .setDescription(request.getDescription())
                .putMetadata("userId", userId)
                .putMetadata("linked_item_id", request.getLinkedItemId())
                .putMetadata("linked_transaction_id", request.getLinkedTransactionId())
                .addPaymentMethodType(request.getPaymentMethod())
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

        // Check for duplicate webhook events (idempotency)
        if (webhookEventRepository.existsByStripeEventId(event.getId())) {
            log.warn("Duplicate webhook event received: {}. Skipping processing.", event.getId());
            return;
        }

        // Save webhook event for audit trail
        WebhookEvent webhookEvent = WebhookEvent.builder()
                .stripeEventId(event.getId())
                .eventType(event.getType())
                .payload(payload)
                .receivedAt(LocalDateTime.now())
                .processed(false)
                .build();
        webhookEvent = webhookEventRepository.save(webhookEvent);
        log.info("Webhook event saved: id={}, type={}", webhookEvent.getId(), event.getType());

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            log.warn("Webhook event data object is empty. Event type: {}", event.getType());
            webhookEvent.setProcessingError("Event data object is empty");
            webhookEventRepository.save(webhookEvent);
            return;
        }

        log.info("Received Stripe Webhook Event: type={}", event.getType());
        
        try {
            PaymentIntent paymentIntent;
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    paymentIntent = (PaymentIntent) stripeObject;
                    log.info("Payment Succeeded for PaymentIntent: {}", paymentIntent.getId());
                    this.processPaymentSucceeded(paymentIntent);
                    break;
                case "payment_intent.payment_failed":
                    paymentIntent = (PaymentIntent) stripeObject;
                    log.warn("Payment Failed for PaymentIntent: {}. Reason: {}", 
                        paymentIntent.getId(), 
                        paymentIntent.getLastPaymentError() != null ? paymentIntent.getLastPaymentError().getMessage() : "Unknown");
                    this.processPaymentFailed(paymentIntent);
                    break;
                default:
                    log.warn("Unhandled Stripe event type: {}", event.getType());
            }
            
            // Mark webhook as processed successfully
            webhookEvent.setProcessed(true);
            webhookEvent.setProcessedAt(LocalDateTime.now());
            webhookEventRepository.save(webhookEvent);
            log.info("Webhook event processed successfully: {}", webhookEvent.getId());
            
        } catch (Exception e) {
            log.error("Error processing webhook event: {}", event.getId(), e);
            webhookEvent.setProcessingError(e.getMessage());
            webhookEventRepository.save(webhookEvent);
            throw e;
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
                .success(true)
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
                .success(false)
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

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PaymentResponse> getPaymentById(String paymentId, String userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new InvalidDataException("You do not have permission to access this payment");
        }

        return ApiResponse.<PaymentResponse>builder()
                .status(OK.value())
                .data(paymentMapper.toPaymentResponse(payment))
                .message("Payment retrieved successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PaymentResponse> getPaymentByTransactionId(String transactionId, String userId) {
        Payment payment = paymentRepository.findFirstByLinkedTransactionIdOrderByCreatedAtDesc(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for transaction: " + transactionId));

        if (!payment.getUserId().equals(userId)) {
            throw new InvalidDataException("You do not have permission to access this payment");
        }

        return ApiResponse.<PaymentResponse>builder()
                .status(OK.value())
                .data(paymentMapper.toPaymentResponse(payment))
                .message("Payment retrieved successfully")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<PaymentResponse> syncPaymentStatusFromStripe(String paymentId, String userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new InvalidDataException("You do not have permission to access this payment");
        }

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());
            String stripeStatus = paymentIntent.getStatus();
            
            log.info("Syncing payment {} status from Stripe: {}", paymentId, stripeStatus);
            
            PaymentStatus oldStatus = payment.getStatus();
            PaymentStatus newStatus = switch (stripeStatus) {
                case "succeeded" -> PaymentStatus.SUCCEEDED;
                case "canceled" -> PaymentStatus.FAILED;
                case "requires_payment_method", "requires_confirmation", "requires_action" -> PaymentStatus.PENDING;
                default -> payment.getStatus();
            };
            
            if (newStatus != oldStatus) {
                payment.setStatus(newStatus);
                paymentRepository.save(payment);
                log.info("Payment {} status updated from {} to {}", paymentId, oldStatus, newStatus);
                
                // Publish events to update transaction and item
                if (newStatus == PaymentStatus.SUCCEEDED) {
                    PaymentEvent sagaEvent = PaymentEvent.builder()
                            .eventId(UUID.randomUUID().toString())
                            .paymentId(payment.getId())
                            .userId(payment.getUserId())
                            .linkedItemId(payment.getLinkedItemId())
                            .linkedTransactionId(payment.getLinkedTransactionId())
                            .amount(payment.getAmount())
                            .currency(payment.getCurrency())
                            .message("Payment completed successfully (synced).")
                            .success(true)
                            .build();
                    messageProducer.publishPaymentCompletedEvent(sagaEvent);
                    log.info("Published payment completed event for payment {}", paymentId);
                } else if (newStatus == PaymentStatus.FAILED) {
                    PaymentEvent sagaEvent = PaymentEvent.builder()
                            .eventId(UUID.randomUUID().toString())
                            .paymentId(payment.getId())
                            .userId(payment.getUserId())
                            .linkedItemId(payment.getLinkedItemId())
                            .linkedTransactionId(payment.getLinkedTransactionId())
                            .message("Payment failed (synced).")
                            .success(false)
                            .build();
                    messageProducer.publishPaymentFailedEvent(sagaEvent);
                    log.info("Published payment failed event for payment {}", paymentId);
                }
            }
            
            return ApiResponse.<PaymentResponse>builder()
                    .status(OK.value())
                    .data(paymentMapper.toPaymentResponse(payment))
                    .message("Payment status synced: " + newStatus)
                    .build();
                    
        } catch (StripeException e) {
            log.error("Error syncing payment status from Stripe: {}", e.getMessage());
            throw new InvalidDataException("Could not sync payment status: " + e.getMessage());
        }
    }
}
