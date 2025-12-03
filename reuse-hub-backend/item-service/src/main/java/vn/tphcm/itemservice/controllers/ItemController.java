/*
 * @ (#) ItemController.java       1.0     9/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 9/27/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.PageResponse;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemSearchRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.response.CommentResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.models.Category;
import vn.tphcm.itemservice.repositories.CategoryRepository;
import vn.tphcm.itemservice.services.ItemService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/items")
@Slf4j(topic = "ITEM-CONTROLLER")
public class ItemController {
    private final ItemService itemService;
    private final CategoryRepository categoryRepository;

    @PostMapping("/create/{userId}")
    public ApiResponse<ItemResponse> createItem(@RequestPart("request") ItemCreationRequest request,
                                                @PathVariable String userId,
                                                @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        log.info("Received request to create item: {} by user: {}", request, userId);

        return itemService.createItem(request, userId, images);
    }

    @PutMapping("/update/{userId}/{itemId}")
    public ApiResponse<ItemResponse> updateItem(@RequestPart("request") ItemUpdateRequest request,
                                                @PathVariable String userId,
                                                @PathVariable String itemId,
                                                @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        log.info("Received request to update item: {} by user: {}", request, userId);

        return itemService.updateItem(request, userId, itemId, images);
    }

    @DeleteMapping("/delete/{userId}/{itemId}")
    public ApiResponse<Void> deleteItem(@PathVariable String userId, @PathVariable String itemId) {
        log.info("Received request to delete item: {} by user: {}", itemId, userId);

        return itemService.deleteItem(itemId, userId);
    }

    @GetMapping("/{itemId}/{currentUserId}")
    public ApiResponse<ItemResponse> getItemById(@PathVariable String itemId, @PathVariable String currentUserId) {
        log.info("Received request to get item by id: {} by user: {}", itemId, currentUserId);

        return itemService.getItemById(itemId, currentUserId);
    }

    @PostMapping("/like/{userId}/{itemId}")
    public ApiResponse<Void> likeItem(@PathVariable String userId, @PathVariable String itemId) {
        log.info("Received request to like item: {} by user: {}", itemId, userId);

        return itemService.likeItem(itemId, userId);
    }

    @PostMapping("/unlike/{userId}/{itemId}")
    public ApiResponse<Void> unlikeItem(@PathVariable String userId, @PathVariable String itemId) {
        log.info("Received request to unlike item: {} by user: {}", itemId, userId);

        return itemService.unlikeItem(itemId, userId);
    }

    @GetMapping("/my-items/{userId}")
    public ApiResponse<PageResponse<ItemResponse>> getMyItems(@PathVariable String userId,
                                                              @RequestParam(defaultValue = "0") int pageNo,
                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                              @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get my items by user: {}", userId);

        return itemService.getMyItem(userId, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/all")
    public ApiResponse<PageResponse<ItemResponse>> getAllItems(@RequestParam(defaultValue = "0") int pageNo,
                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                              @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get all items");

        return itemService.getAllItems(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/popular")
    public ApiResponse<PageResponse<ItemResponse>> getPopularItems(@RequestParam(defaultValue = "0") int pageNo,
                                                                  @RequestParam(defaultValue = "10") int pageSize,
                                                                  @RequestParam(defaultValue = "likeCount") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get popular items");

        return itemService.getPopularItems(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/{categorySlug}")
    public ApiResponse<PageResponse<ItemResponse>> getItemsByCategory(@PathVariable String categorySlug,
                                                                     @RequestParam(defaultValue = "0") int pageNo,
                                                                     @RequestParam(defaultValue = "10") int pageSize,
                                                                     @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                     @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get items by category: {}", categorySlug);

        return itemService.getItemsByCategory(categorySlug, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/search")
    public ApiResponse<PageResponse<ItemResponse>> searchItems(@RequestParam String keyword,
                                                       @RequestParam(defaultValue = "0") int pageNo,
                                                       @RequestParam(defaultValue = "10") int pageSize,
                                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                                       @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to search items with keyword: {}", keyword);
        
        ItemSearchRequest request = new ItemSearchRequest();
        request.setKeyword(keyword);

        return itemService.searchItems(request, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/comments/{itemId}")
    public ApiResponse<PageResponse<CommentResponse>> getItemComments(@PathVariable String itemId,
                                                              @RequestParam(defaultValue = "0") int pageNo,
                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                              @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get comments for item: {}", itemId);

        return itemService.getItemComments(itemId, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/tags")
    @Operation(summary = "Get items by tags",
            description = "Retrieve a paginated list of items that match any of the specified tags.")
    public ApiResponse<PageResponse<ItemResponse>> getItemsByTags(@RequestParam List<String> tags,
                                                                  @RequestParam(defaultValue = "0") int pageNo,
                                                                  @RequestParam(defaultValue = "10") int pageSize,
                                                                  @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get items by tags: {}", tags);

        return itemService.getItemsByTags(tags, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/nearby")
    @Operation(summary = "Get nearby items", description = "Retrieve a paginated list of items located within a specified radius from given latitude and longitude.")
    public ApiResponse<PageResponse<ItemResponse>> getNearbyItems(@RequestParam double latitude,
                                                                  @RequestParam double longitude,
                                                                  @RequestParam(defaultValue = "5000") double radius,
                                                                  @RequestParam(defaultValue = "0") int pageNo,
                                                                  @RequestParam(defaultValue = "10") int pageSize,
                                                                  @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get nearby items at lat: {}, long: {}, radius: {}", latitude, longitude, radius);

        return itemService.searchItemsNearby(latitude, longitude, radius, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/categories")
    @Operation(summary = "Get all categories", description = "Returns list of all categories for dropdowns")
    public ApiResponse<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAllCategories();

            return ApiResponse.<List<Category>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Fetched categories successfully")
                    .data(categories)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching categories", e);
            return ApiResponse.<List<Category>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error fetching categories: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }
}
