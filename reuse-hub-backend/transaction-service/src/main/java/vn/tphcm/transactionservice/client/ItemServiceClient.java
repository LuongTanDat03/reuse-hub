/*
 * @ (#) ItemServiceClient.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.client;
/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.tphcm.transactionservice.commons.ItemStatus;
import vn.tphcm.transactionservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.transactionservice.dtos.ApiResponse;
import vn.tphcm.transactionservice.dtos.response.ItemResponse;

@FeignClient(name = "item-service", url = "${feign.client.config.item-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ItemServiceClient {
    @GetMapping(value = "/{itemId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ItemResponse> getItemById(@PathVariable String itemId);

    @PutMapping(value = "/{itemId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<ItemResponse> updateItemStatus(@PathVariable String itemId, @RequestParam ItemStatus status);
}
