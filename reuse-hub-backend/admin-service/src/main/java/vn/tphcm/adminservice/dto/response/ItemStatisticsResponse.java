/*
 * @ (#) ItemStatisticsResponse.java       1.0     11/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 11/26/2025
 */

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class ItemStatisticsResponse {
    private Long totalItems;
    private Map<String, Long> itemStats;
}
