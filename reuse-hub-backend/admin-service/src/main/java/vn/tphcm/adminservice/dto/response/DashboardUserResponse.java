/*
 * @ (#) DashboardUserResponse.java       1.0     11/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 11/26/2025
 */

import lombok.*;
import vn.tphcm.adminservice.dto.PageResponse;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardUserResponse {
    private PageResponse<InfoUserResponse> users;

    private UserStatisticsResponse statistics;
}
