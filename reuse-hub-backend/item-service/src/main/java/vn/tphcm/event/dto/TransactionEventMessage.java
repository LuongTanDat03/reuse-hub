/*
 * @ (#) TransactionEventMessage.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import lombok.*;
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.commons.TransactionStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEventMessage {
    private EventType eventType;
    private String transactionId;
    private String buyerId;
    private String sellerId;
    private String itemId;
    private String itemTitle;
    private Long totalAmount;
    private TransactionStatus status;
    private String message;
}
