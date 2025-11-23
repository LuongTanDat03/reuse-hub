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

import vn.tphcm.itemservice.dtos.PageResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;

public interface CacheService {
    // Cache single item
    void cacheItem(String itemId, ItemResponse response);

    ItemResponse getCachedItem(String itemId);

    void evictCachedItem(String itemId);

    // Cache popular items
    void cachePopularItems(PageResponse<ItemResponse> items);

    PageResponse<ItemResponse> getCachedPopularItems();

    void evictCachedPopularItems();

    // Cache user-specific items
    void cacheUserItems(String userId, PageResponse<ItemResponse> items, int page, int size, String sortBy, String sortDirection);

    PageResponse<ItemResponse> getCachedUserItems(String userId, int page, int size, String sortBy, String sortDirection);

    Long incrementItemViewCount(String itemId);

    void evictAllUserItems(String userId);

    // Cache all items

    void cacheAllItems(int page, int size, String sortBy, String sortDirection, PageResponse<ItemResponse> items);

    PageResponse<ItemResponse> getCachedAllItems(int page, int size, String sortBy, String sortDirection);

    void evictAllItems();

    void evictAllRelatedCaches(String itemId, String userId);
}
