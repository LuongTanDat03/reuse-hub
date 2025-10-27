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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemSearchRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.services.ItemService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/items")
@Slf4j(topic = "ITEM-CONTROLLER")
public class ItemController {
    private final ItemService itemService;

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
    public ApiResponse<Page<ItemResponse>> getMyItems(@PathVariable String userId,
                                                             @RequestParam(defaultValue = "0") int pageNo,
                                                             @RequestParam(defaultValue = "10") int pageSize,
                                                             @RequestParam(defaultValue = "createdAt") String sortBy,
                                                             @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get my items by user: {}", userId);

        return itemService.getMyItem(userId, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/all")
    public ApiResponse<Page<ItemResponse>> getAllItems(@RequestParam(defaultValue = "0") int pageNo,
                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                              @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get all items");

        return itemService.getAllItems(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/popular")
    public ApiResponse<Page<ItemResponse>> getPopularItems(@RequestParam(defaultValue = "0") int pageNo,
                                                                  @RequestParam(defaultValue = "10") int pageSize,
                                                                  @RequestParam(defaultValue = "likeCount") String sortBy,
                                                                  @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get popular items");

        return itemService.getPopularItems(pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/{category}")
    public ApiResponse<Page<ItemResponse>> getItemsByCategory(@PathVariable String category,
                                                                     @RequestParam(defaultValue = "0") int pageNo,
                                                                     @RequestParam(defaultValue = "10") int pageSize,
                                                                     @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                     @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to get items by category: {}", category);

        return itemService.getItemsByCategory(category, pageNo, pageSize, sortBy, sortDirection);
    }

    @GetMapping("/public/search")
    public ApiResponse<Page<ItemResponse>> searchItems(@RequestBody ItemSearchRequest request,
                                                       @RequestParam(defaultValue = "0") int pageNo,
                                                       @RequestParam(defaultValue = "10") int pageSize,
                                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                                       @RequestParam(defaultValue = "desc") String sortDirection) {
        log.info("Received request to search items with criteria: {}", request);

        return itemService.searchItems(request, pageNo, pageSize, sortBy, sortDirection);
    }
}
