/*
 * @ (#) PaymentResponse.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.dtos.response;
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
public class PaymentResponse {
    private String clientSecret;

    private String paymentId;
}
