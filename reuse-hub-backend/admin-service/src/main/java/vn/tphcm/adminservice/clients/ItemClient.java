/*
 * @ (#) ItemClient.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.clients;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import vn.tphcm.adminservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.PageResponse;
import vn.tphcm.adminservice.dto.response.ItemResponse;
import vn.tphcm.adminservice.dto.response.ItemStatisticsResponse;

import java.util.Map;

@FeignClient(name = "item-service", url = "${feign.client.config.item-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ItemClient {
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PageResponse<ItemResponse>> getAllItems(@RequestParam(defaultValue = "0") int pageNo,
                                                        @RequestParam(defaultValue = "10") int pageSize,
                                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                                        @RequestParam(defaultValue = "desc") String sortDirection,
                                                        @RequestParam(required = false) String filter);

    @GetMapping("/statistics")
    ApiResponse<ItemStatisticsResponse> getItemStatistics();

    @DeleteMapping("/{itemId}")
    ApiResponse<Void> deleteItem(@PathVariable String itemId);
}

