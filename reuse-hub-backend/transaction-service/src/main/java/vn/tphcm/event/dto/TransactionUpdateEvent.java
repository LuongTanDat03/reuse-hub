/*
 * @ (#) TransactionUpdateEvent.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import lombok.*;
import vn.tphcm.transactionservice.commons.TransactionStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionUpdateEvent {
    private String transactionId;
    private String userId;
    private TransactionStatus status;
    private TransactionStatus previousStatus;
    private String updateMessage;
}
