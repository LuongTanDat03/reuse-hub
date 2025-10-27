/*
 * @ (#) CacheService.java       1.0     9/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/20/2025
 */

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import vn.tphcm.itemservice.dtos.response.ItemResponse;

@Service
public interface CacheService {
    // Cache single item
    void cacheItem(String itemId, ItemResponse response);

    ItemResponse getCachedItem(String itemId);

    void evictCachedItem(String itemId);

    // Cache popular items
    void cachePopularItems(Page<ItemResponse> items);

    Page<ItemResponse> getCachedPopularItems();

    void evictCachedPopularItems();

    // Cache user-specific items
    void cacheUserItems(String userId, Page<ItemResponse> items, int page, int size, String sortBy, String sortDirection);

    Page<ItemResponse> getCachedUserItems(String userId, int page, int size, String sortBy, String sortDirection);

    void incrementItemViewCount(String itemId);

    void evictAllUserItems(String userId);

    // Cache all items

    void cacheAllItems(int page, int size, String sortBy, String sortDirection, Page<ItemResponse> items);

    Page<ItemResponse> getCachedAllItems(int page, int size, String sortBy, String sortDirection);

    void evictAllItems();
}
