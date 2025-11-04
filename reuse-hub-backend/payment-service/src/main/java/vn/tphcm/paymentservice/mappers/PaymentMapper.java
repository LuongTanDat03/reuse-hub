/*
 * @ (#) PaymentMapper.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.mappers;

/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import org.mapstruct.Mapper;
import vn.tphcm.paymentservice.dtos.request.CreatePaymentRequest;
import vn.tphcm.paymentservice.dtos.response.PaymentResponse;
import vn.tphcm.paymentservice.models.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    Payment toPayment(CreatePaymentRequest request);

    PaymentResponse toPaymentResponse(Payment payment);
}
