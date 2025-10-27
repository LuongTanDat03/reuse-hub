/*
 * @ (#) UpdateTransactionStatusRequest.java       1.0     10/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 10/22/2025
 */

import lombok.Getter;
import vn.tphcm.transactionservice.commons.TransactionStatus;

@Getter
public class UpdateTransactionStatusRequest {
    private TransactionStatus status;

    private String trackingCode;

    private String notes;
}
