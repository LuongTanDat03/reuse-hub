/*
 * @ (#) WebhookEventController.java       1.0     11/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.paymentservice.dtos.ApiResponse;
import vn.tphcm.paymentservice.models.WebhookEvent;
import vn.tphcm.paymentservice.repositories.WebhookEventRepository;

import static org.springframework.http.HttpStatus.OK;

/*
 * @author: Luong Tan Dat
 * @date: 11/28/2025
 */

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Slf4j(topic = "WEBHOOK-EVENT-CONTROLLER")
@Tag(name = "Webhook Events", description = "Admin endpoints for webhook event monitoring")
public class WebhookEventController {
    
    private final WebhookEventRepository webhookEventRepository;
    
    @GetMapping
    @Operation(summary = "Get all webhook events (Admin only)",
            description = "Returns paginated list of all webhook events for monitoring and debugging")
    public ApiResponse<Page<WebhookEvent>> getAllWebhookEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "receivedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Sort sort = sortDirection.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<WebhookEvent> events = webhookEventRepository.findAll(pageRequest);
        
        return ApiResponse.<Page<WebhookEvent>>builder()
                .status(OK.value())
                .message("Webhook events retrieved successfully")
                .data(events)
                .build();
    }
    
    @GetMapping("/{eventId}")
    @Operation(summary = "Get webhook event by ID",
            description = "Returns detailed information about a specific webhook event")
    public ApiResponse<WebhookEvent> getWebhookEventById(@PathVariable String eventId) {
        WebhookEvent event = webhookEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Webhook event not found"));
        
        return ApiResponse.<WebhookEvent>builder()
                .status(OK.value())
                .message("Webhook event retrieved successfully")
                .data(event)
                .build();
    }
    
    @GetMapping("/stripe/{stripeEventId}")
    @Operation(summary = "Get webhook event by Stripe event ID",
            description = "Returns webhook event by Stripe's event ID")
    public ApiResponse<WebhookEvent> getWebhookEventByStripeId(@PathVariable String stripeEventId) {
        WebhookEvent event = webhookEventRepository.findByStripeEventId(stripeEventId)
                .orElseThrow(() -> new RuntimeException("Webhook event not found"));
        
        return ApiResponse.<WebhookEvent>builder()
                .status(OK.value())
                .message("Webhook event retrieved successfully")
                .data(event)
                .build();
    }
}
