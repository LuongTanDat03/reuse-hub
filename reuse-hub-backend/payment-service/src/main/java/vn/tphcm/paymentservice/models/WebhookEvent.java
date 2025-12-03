/*
 * @ (#) WebhookEvent.java       1.0     11/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/*
 * @author: Luong Tan Dat
 * @date: 11/28/2025
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_webhook_events", indexes = {
    @Index(name = "idx_stripe_event_id", columnList = "stripe_event_id"),
    @Index(name = "idx_event_type", columnList = "event_type"),
    @Index(name = "idx_received_at", columnList = "received_at"),
    @Index(name = "idx_processed", columnList = "processed")
})
@Entity
@Builder
public class WebhookEvent extends AbstractEntity<String> {
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "stripe_event_id", unique = true, nullable = false)
    private String stripeEventId;
    
    @Column(columnDefinition = "TEXT")
    private String payload;
    
    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean processed = false;
    
    @Column(name = "processing_error", columnDefinition = "TEXT")
    private String processingError;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
