/*
 * @ (#) PaymentDetailResponse.java       1.0     11/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.dtos.response;

import lombok.*;
import vn.tphcm.paymentservice.commons.PaymentStatus;

import java.time.LocalDateTime;

/*
 * @author: Luong Tan Dat
 * @date: 11/28/2025
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDetailResponse {
    private String paymentId;
    private String userId;
    private Long amount;
    private String currency;
    private PaymentStatus status;
    private String description;
    private String linkedItemId;
    private String linkedTransactionId;
    private String paymentMethod;
    private String stripePaymentIntentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
