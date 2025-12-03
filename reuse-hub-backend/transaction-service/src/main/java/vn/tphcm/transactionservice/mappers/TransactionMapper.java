/*
 * @ (#) TransactionMapper.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.mappers;

/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import org.mapstruct.Mapper;
import vn.tphcm.transactionservice.dtos.request.CreateTransactionRequest;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.models.Transaction;

import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    Transaction toTransaction(CreateTransactionRequest request);
    
    TransactionResponse toResponse(Transaction transaction);
}
