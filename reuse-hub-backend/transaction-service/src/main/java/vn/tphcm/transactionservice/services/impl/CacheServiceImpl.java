/*
 * @ (#) CacheServiceImpl.java       1.0     10/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/31/2025
 */

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.transactionservice.dtos.response.TransactionResponse;
import vn.tphcm.transactionservice.services.CacheService;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CACHE-SERVICE")
public class CacheServiceImpl implements CacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String TRANSACTION_KEY_PREFIX = "transaction:";

    private static final Duration DEFAULT_TTL = Duration.ofMinutes(30);

    @Override
    public void cacheTransaction(String transactionId, TransactionResponse response) {
        try {
            String key = TRANSACTION_KEY_PREFIX + transactionId;
            redisTemplate.opsForValue().set(key, response, DEFAULT_TTL);
            log.info("Cached transaction {} with key {}", transactionId, key);
        } catch (Exception e) {
            log.error("Failed to cache transaction {}: {}", transactionId, e.getMessage());
        }
    }

    @Override
    public Page<TransactionResponse> getCachedTransaction(String transactionId) {
        try {
            Object cached = redisTemplate.opsForValue().get(TRANSACTION_KEY_PREFIX);
            if (cached != null) {
                log.info("Cache hit for transaction {} with key {}", transactionId, TRANSACTION_KEY_PREFIX);
                return objectMapper.convertValue(cached, new TypeReference<Page<TransactionResponse>>() {
                });
            }
        } catch (Exception e) {
            log.error("Failed to get cached transaction {}: {}", transactionId, e.getMessage());
        }
        return null;
    }

    @Override
    public void evictCachedTransaction(String transactionId) {
        try {
            Object cached = redisTemplate.opsForValue().get(TRANSACTION_KEY_PREFIX);
            if (cached != null) {
                redisTemplate.delete(TRANSACTION_KEY_PREFIX);
                log.info("Evicted cached transaction {} with key {}", transactionId, TRANSACTION_KEY_PREFIX);
            } else {
                log.info("No cached transaction found for key {}", TRANSACTION_KEY_PREFIX);
            }
        } catch (Exception e) {
            log.error("Failed to evict cached transaction {}: {}", transactionId, e.getMessage());
        }
    }
}
