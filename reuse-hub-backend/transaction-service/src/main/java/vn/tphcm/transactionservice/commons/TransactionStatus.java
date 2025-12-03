/*
 * @ (#) TransactionStatus.java       1.0     8/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */
package vn.tphcm.transactionservice.commons;

/*
 * @author: Luong Tan Dat
 * @date: 8/24/2025
 */

public enum TransactionStatus {
    PENDING,
    CONFIRMED,
    RESERVED,
    PAYMENT_PENDING,
    PAYMENT_COMPLETED,
    IN_DELIVERY,
    DELIVERY,
    COMPLETED,
    CANCELLED,
    REFUNDED
}
