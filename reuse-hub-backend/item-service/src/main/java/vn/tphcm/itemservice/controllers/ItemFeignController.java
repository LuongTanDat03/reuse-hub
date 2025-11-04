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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.tphcm.itemservice.dtos.ApiResponse;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.services.ItemService;

@RestController
@RequiredArgsConstructor
@RequestMapping("item-feign")
@Slf4j(topic = "ITEM-FEIGN-CONTROLLER")
public class ItemFeignController {
    private final ItemService itemService;

    @GetMapping("/{itemId}")
    public ApiResponse<ItemResponse> getItemById(@PathVariable String itemId){
        log.info("Feign client request to get item by id: {}", itemId);

        return itemService.getItemFeignById(itemId);
    }
}
