/*
 * @ (#) CacheServiceImpl.java       1.0     9/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/20/2025
 */

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.services.CacheService;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CACHE-SERVICE")
public class CacheServiceImpl implements CacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String ITEM_KEY_PREFIX = "item:";
    private static final String POPULAR_ITEMS_KEY = "items:popular";
    private static final String USER_ITEMS_KEY_PREFIX = "items:user:";
    private static final String VIEW_COUNT_PREFIX = "item:views:";
    private static final String ALL_ITEMS_KEY_PREFIX = "items:all:";

    private static final Duration DEFAULT_TTL = Duration.ofMinutes(30);
    private static final Duration LIST_TTL = Duration.ofMinutes(15);
    private static final Duration POPULAR_ITEMS_TTL = Duration.ofMinutes(10);

    @Override
    public void cacheItem(String itemId, ItemResponse response) {
        try {
            String key = ITEM_KEY_PREFIX + itemId;
            redisTemplate.opsForValue().set(key, response, DEFAULT_TTL);
            log.info("Cached item {} with key {}", itemId, key);
        } catch (Exception e) {
            log.error("Failed to cache item {}: {}", itemId, e.getMessage());
        }
    }

    @Override
    public ItemResponse getCachedItem(String itemId) {
        try {
            String key = ITEM_KEY_PREFIX + itemId;
            Object cachedData = redisTemplate.opsForValue().get(key);
            if (cachedData != null) {
                log.info("Cache hit for item {} with key {}", itemId, key);
                return objectMapper.convertValue(cachedData, ItemResponse.class);
            }
        } catch (Exception e) {
            log.error("Failed to get cached item {}: {}", itemId, e.getMessage());
        }

        return null;
    }

    @Override
    public void evictCachedItem(String itemId) {
        try {
            String key = ITEM_KEY_PREFIX + itemId;
            redisTemplate.delete(key);
            log.info("Evicted cached item {} with key {}", itemId, key);
        } catch (Exception e) {
            log.error("Failed to evict cached item {}: {}", itemId, e.getMessage());
        }
    }

    @Override
    public void cachePopularItems(Page<ItemResponse> items) {
        try {
            redisTemplate.opsForValue().set(POPULAR_ITEMS_KEY, items, POPULAR_ITEMS_TTL);
            log.info("Cached popular items with key {}", POPULAR_ITEMS_KEY);
        } catch (Exception e) {
            log.error("Failed to cache popular items: {}", e.getMessage());
        }
    }

    @Override
    public Page<ItemResponse> getCachedPopularItems() {
        try {
            Object cached = redisTemplate.opsForValue().get(POPULAR_ITEMS_KEY);
            if (cached != null) {
                log.info("Cache hit for popular items with key {}", POPULAR_ITEMS_KEY);
                return objectMapper.convertValue(cached, new TypeReference<Page<ItemResponse>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to get cached popular items: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public void evictCachedPopularItems() {
        try {
            Object cached = redisTemplate.opsForValue().get(POPULAR_ITEMS_KEY);
            if (cached != null) {
                redisTemplate.delete(POPULAR_ITEMS_KEY);
                log.info("Evicted cached popular items with key {}", POPULAR_ITEMS_KEY);
            } else {
                log.info("No cached popular items to evict with key {}", POPULAR_ITEMS_KEY);
            }
        }catch (Exception e) {
            log.error("Failed to evict cached popular items: {}", e.getMessage());
        }
    }

    @Override
    public void cacheUserItems(String userId, Page<ItemResponse> items, int page, int size, String sortBy, String sortDirection) {
        try {
            String key = generateUserItemsKey(userId, page, size, sortBy, sortDirection);
            redisTemplate.opsForValue().set(key, items, DEFAULT_TTL);
            log.info("Cached items for user {} with key {}", userId, key);
        } catch (Exception e) {
            log.error("Failed to cache items for user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Page<ItemResponse> getCachedUserItems(String userId, int page, int size, String sortBy, String sortDirection) {
        try {
            String key = generateUserItemsKey(userId, page, size, sortBy, sortDirection);
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.info("Cache hit for user {} items with key {}", userId, key);
                return objectMapper.convertValue(cached, new TypeReference<Page<ItemResponse>>() {
                });
            }
        } catch (Exception e) {
            log.error("Failed to get cached items for user {}: {}", userId, e.getMessage());
        }

        return null;
    }

    @Override
    public Long incrementItemViewCount(String itemId) {
        try {
            String key = VIEW_COUNT_PREFIX + itemId;
            redisTemplate.opsForValue().increment(key);
            redisTemplate.expire(key, Duration.ofDays(7));
            log.info("Incremented view count for item {} with key {}", itemId, key);
            return (Long) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("Failed to increment view count for item {}: {}", itemId, e.getMessage());
        }
        return null;
    }

    @Override
    public void evictAllUserItems(String userId) {
        try {
            String key = USER_ITEMS_KEY_PREFIX + userId;
            redisTemplate.delete(key);
            log.info("Evicted all cached items for user {} with key {}", userId, key);
        } catch (Exception e) {
            log.error("Failed to evict cached items for user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public void cacheAllItems(int page, int size, String sortBy, String sortDirection, Page<ItemResponse> items) {
        try {
            String key = generateAllItemsKey(page, size, sortBy, sortDirection);
            redisTemplate.opsForValue().set(key, items, LIST_TTL);
            log.info("Cached all items with key {}", key);
        } catch (Exception e) {
            log.error("Failed to cache all items: {}", e.getMessage());
        }
    }

    @Override
    public Page<ItemResponse> getCachedAllItems(int page, int size, String sortBy, String sortDirection) {
        try {
            String key = generateAllItemsKey(page, size, sortBy, sortDirection);
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.info("Cache hit for all items with key {}", key);
                return objectMapper.convertValue(cached, new TypeReference<Page<ItemResponse>>() {
                });
            }
        } catch (Exception e) {
            log.error("Failed to get cached all items: {}", e.getMessage());
        }

        return null;
    }

    @Override
    public void evictAllItems() {
        try {
            String pattern = ALL_ITEMS_KEY_PREFIX + "*";
            redisTemplate.delete(redisTemplate.keys(pattern));
            log.info("Evicted all cached items with pattern {}", pattern);
        } catch (Exception e) {
            log.error("Failed to evict all cached items: {}", e.getMessage());
        }
    }

    private String generateUserItemsKey(String userId, int page, int size, String sortBy, String sortDirection) {
        return USER_ITEMS_KEY_PREFIX + userId + ":page:" + page + ":size:" + size + ":sortBy:" + sortBy + ":sortDir:" + sortDirection;
    }

    private String generateAllItemsKey(int page, int size, String sortBy, String sortDirection) {
        return "items:all:page:" + page + ":size:" + size + ":sortBy:" + sortBy + ":sortDir:" + sortDirection;
    }
}
