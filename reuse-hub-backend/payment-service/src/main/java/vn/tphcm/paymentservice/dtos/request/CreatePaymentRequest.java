/*
 * @ (#) CreatePaymentRequest.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import lombok.Getter;
import vn.tphcm.paymentservice.commons.PaymentMethod;

@Getter
public class CreatePaymentRequest {
    private Long amount;

    private String currency;

    private String description;

    private String linkedItemId;

    private String linkedTransactionId;

    private PaymentMethod paymentMethod;
}
