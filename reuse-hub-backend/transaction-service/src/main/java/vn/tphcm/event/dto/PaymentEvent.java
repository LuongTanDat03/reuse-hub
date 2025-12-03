/*
 * @ (#) PaymentEvent.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEvent {
    private String eventId;
    private String paymentId;
    private String userId;
    private String linkedItemId;
    private String linkedTransactionId;
    private Long amount;
    private String currency;
    private String message;
    private boolean success;
}
