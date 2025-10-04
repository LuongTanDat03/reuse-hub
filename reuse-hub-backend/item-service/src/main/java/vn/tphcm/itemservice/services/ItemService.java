/*
 * @ (#) ItemService.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemSearchRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.dtos.response.ItemSummaryResponse;

import java.util.List;


@Service
public interface ItemService {
    ApiResponse<ItemResponse> createItem(ItemCreationRequest request, String userId, List<MultipartFile> images);

    ApiResponse<ItemResponse> updateItem(ItemUpdateRequest request, String itemId, String userId, List<MultipartFile> images);

    ApiResponse<Void> deleteItem(String itemId, String userId);

    ApiResponse<ItemResponse> getItemById(String itemId, String currentUserId);

    ApiResponse<Void> likeItem(String itemId, String userId);

    ApiResponse<Void> unlikeItem(String itemId, String userId);

    ApiResponse<Page<ItemSummaryResponse>> getMyItem(String userId, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<Page<ItemSummaryResponse>> getAllItems(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<Page<ItemSummaryResponse>> searchItems(ItemSearchRequest request, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<Page<ItemSummaryResponse>> getPopularItems(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<Page<ItemSummaryResponse>> getItemsByCategory(String category, int pageNo, int pageSize, String sortBy, String sortDirection);
}
