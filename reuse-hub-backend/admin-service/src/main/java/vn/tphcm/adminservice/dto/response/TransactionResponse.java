/*
 * @ (#) TransactionResponse.java       1.0     10/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/22/2025
 */

import lombok.*;
import vn.tphcm.adminservice.commons.TransactionStatus;
import vn.tphcm.adminservice.commons.DeliveryMethod;
import vn.tphcm.adminservice.commons.TransactionType;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private String id;
    private String itemId;
    private String itemTitle;
    private String itemImageUrl;
    private Double itemPrice;
    private String buyerId;
    private String sellerId;
    private TransactionStatus status;
    private TransactionType type;
    private Integer quantity;
    private Double totalPrice;
    private DeliveryMethod deliveryMethod;
    private String deliveryDate;
    private String deliveryAddress;
    private String deliveryPhone;
    private String deliveryNotes;
    private String buyerNotes;
    private String sellerNotes;
    private String deliveryTrackingCode;
    private String buyerFeedback;
    private String cancelledBy;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime expiresAt;


}
