/*
 * @ (#) TransactionClient.java       1.0     11/24/2025
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.tphcm.adminservice.configs.AuthenticationRequestInterceptor;
import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.PageResponse;
import vn.tphcm.adminservice.dto.response.TransactionResponse;
import vn.tphcm.adminservice.dto.response.TransactionStatisticsResponse;

import java.util.Map;

@FeignClient(name = "transaction-service", url = "${feign.client.config.transaction-service.url}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface TransactionClient {
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<PageResponse<TransactionResponse>> getAllTransactions(@RequestParam(defaultValue = "0") int pageNo,
                                                                      @RequestParam(defaultValue = "10") int pageSize,
                                                                      @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                      @RequestParam(defaultValue = "desc") String sortDirection);

    @GetMapping(value = "/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<TransactionStatisticsResponse> getTransactionStatistics();
}
