/*
 * @ (#) WalletEvent.java       1.0     12/4/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletEvent implements Serializable {
    private String userId;           // Seller ID
    private Long amount;             // 90% of transaction amount
    private String transactionId;
    private String itemId;
    private String description;
}
