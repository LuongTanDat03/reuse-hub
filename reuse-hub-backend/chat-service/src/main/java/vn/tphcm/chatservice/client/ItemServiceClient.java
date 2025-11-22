/*
 * @ (#) ItemServiceClient.java       1.0     11/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.client;
/*
 * @author: Luong Tan Dat
 * @date: 11/20/2025
 */

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import vn.tphcm.chatservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.response.ItemResponse;

@FeignClient(name = "item-service", url = "${feign.client.config.item-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface ItemServiceClient {
    @GetMapping(value = "/item-feign/{itemId}")
    ApiResponse<ItemResponse> getItemById(@PathVariable String itemId);
}
