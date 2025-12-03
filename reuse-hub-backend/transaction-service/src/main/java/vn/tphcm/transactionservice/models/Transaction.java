/*
 * @ (#) Transaction.java       1.0     8/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/24/2025
 */

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.tphcm.transactionservice.commons.DeliveryMethod;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_transaction")
@Builder
public class Transaction extends AbstractEntity<String> implements Serializable {
    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "item_title", nullable = false)
    private String itemTitle;

    @Column(name = "item_image_url")
    private String itemImageUrl;

    @Column(name = "item_price", nullable = false)
    private Long itemPrice;

    @Column(name = "buyer_id", nullable = false)
    private String buyerId;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TransactionStatus status;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TransactionType type;

    private Integer quantity;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "delivery_method", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private DeliveryMethod deliveryMethod;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_phone")
    private String deliveryPhone;

    @Column(name = "delivery_notes", length = 1000)
    private String deliveryNotes;

    @Column(name = "buyer_note", length = 1000)
    private String buyerNotes;

    @Column(name = "seller_note", length = 1000)
    private String sellerNotes;

    @Column(name = "delivery_tracking_code")
    private String deliveryTrackingCode;

    @Column(name = "buyer_feedback", length = 2000)
    private String buyerFeedback;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    private String reason;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "feedback_submitted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean feedbackSumitted = false;
}
