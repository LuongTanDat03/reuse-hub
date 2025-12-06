/*
 * @ (#) ItemFeignController.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.PageResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.dtos.response.ItemStatisticsResponse;
import vn.tphcm.itemservice.services.ItemService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/item-feign")
@Slf4j(topic = "ITEM-FEIGN-CONTROLLER")
public class ItemFeignController {
    private final ItemService itemService;

    @GetMapping("/{itemId}")
    public ApiResponse<ItemResponse> getItemById(@PathVariable String itemId){
        log.info("Feign client request to get item by id: {}", itemId);

        return itemService.getItemFeignById(itemId);
    }

    @GetMapping
    public ApiResponse<PageResponse<ItemResponse>> getAllItems(@RequestParam(defaultValue = "0") int pageNo,
                                                               @RequestParam(defaultValue = "10") int pageSize,
                                                               @RequestParam(defaultValue = "createdAt") String sortBy,
                                                               @RequestParam(defaultValue = "desc") String sortDirection,
                                                               @RequestParam(required = false) String categorySlug) {
        log.info("Feign client request to get all items");

        return itemService.getItems(pageNo, pageSize, sortBy, sortDirection, categorySlug);
    }

    @GetMapping("/statistics")
    public ApiResponse<ItemStatisticsResponse> getItemStatistics() {
        log.info("Feign client request to get item statistics");

        return itemService.getItemStatistics();
    }

    @DeleteMapping("/{itemId}")
    public ApiResponse<Void> deleteItem(@PathVariable String itemId) {
        log.info("Feign client request to delete item by id: {}", itemId);

        return itemService.deleteItemForAdmin(itemId);
    }
}
