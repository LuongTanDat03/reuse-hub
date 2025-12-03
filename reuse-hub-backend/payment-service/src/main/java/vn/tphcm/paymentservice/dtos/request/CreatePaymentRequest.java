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

import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class CreatePaymentRequest {
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Long amount;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[a-z]{3}$", message = "Currency must be 3 lowercase letters (e.g., vnd, usd)")
    private String currency;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String linkedItemId;

    @NotBlank(message = "Transaction ID is required")
    private String linkedTransactionId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
