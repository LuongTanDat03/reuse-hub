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

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.event.dto.FeedbackEvent;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.PageResponse;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemSearchRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.response.CommentResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.dtos.response.ItemStatisticsResponse;

import java.util.List;
import java.util.Map;

public interface ItemService {
    ApiResponse<ItemResponse> createItem(ItemCreationRequest request, String userId, List<MultipartFile> images);

    ApiResponse<ItemResponse> updateItem(ItemUpdateRequest request, String itemId, String userId, List<MultipartFile> images);

    ApiResponse<Void> deleteItem(String itemId, String userId);

    ApiResponse<ItemResponse> getItemById(String itemId, String currentUserId);

    ApiResponse<Void> likeItem(String itemId, String userId);

    ApiResponse<Void> unlikeItem(String itemId, String userId);

    ApiResponse<PageResponse<ItemResponse>> getMyItem(String userId, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> getAllItems(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> searchItems(ItemSearchRequest request, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> getPopularItems(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> getItemsByCategory(String categorySlug, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<CommentResponse>> getItemComments(String itemId, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<ItemResponse> getItemFeignById(String itemId);

    ApiResponse<PageResponse<ItemResponse>> searchItemsNearby(double latitude, double longitude, double radius, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> getItemsByTags(List<String> tags, int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<PageResponse<ItemResponse>> getItems(int pageNo, int pageSize, String sortBy, String sortDirection, String filter);

    void processItemBoost(String itemId);

    void processNewFeedback(FeedbackEvent event);

    void updateItemTagsFromAi(String itemId, List<String> tags);

    ApiResponse<ItemStatisticsResponse> getItemStatistics();

    ApiResponse<Void> deleteItemForAdmin(String itemId);
}
