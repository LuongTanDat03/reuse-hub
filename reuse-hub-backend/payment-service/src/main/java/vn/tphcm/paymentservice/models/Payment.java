/*
 * @ (#) Payment.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.tphcm.paymentservice.commons.PaymentStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_payments", indexes = {
    @Index(name = "idx_stripe_payment_intent_id", columnList = "stripe_payment_intent_id"),
    @Index(name = "idx_linked_transaction_id", columnList = "linkedTransactionId"),
    @Index(name = "idx_user_id_status", columnList = "user_id, status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Entity
@Builder
public class Payment extends AbstractEntity<String> {
    @Column(name = "user_id")
    private String userId;

    private Long amount;

    private String currency;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    private String description;

    private String linkedItemId;

    @Column(unique = true)
    private String linkedTransactionId;

    private String paymentMethod;
}
