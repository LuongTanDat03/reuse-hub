/*
 * @ (#) CacheService.java       1.0     10/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 10/31/2025
 */

import org.springframework.data.domain.Page;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;

public interface CacheService {
    void cacheTransaction(String transactionId, TransactionResponse response);
    Page<TransactionResponse> getCachedTransaction(String transactionId);
    void evictCachedTransaction(String transactionId);
}
