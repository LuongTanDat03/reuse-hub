/*
 * @ (#) CreateTransactionRequest.java       1.0     10/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 10/22/2025
 */

import lombok.Getter;
import vn.tphcm.transactionservice.commons.DeliveryMethod;
import vn.tphcm.transactionservice.commons.TransactionType;

@Getter
public class CreateTransactionRequest {
    private String itemId;

    private TransactionType transactionType;

    private Integer quantity;

    private Integer price;

    private DeliveryMethod deliveryMethod;

    private String deliveryAddress;

    private String deliveryPhone;

    private String deliveryNotes;

    private String buyerNotes;
}
