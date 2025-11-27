/*
 * @ (#) UserService.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import vn.tphcm.identityservice.commons.UserStatus;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.PageResponse;
import vn.tphcm.identityservice.dtos.response.InfoUserResponse;
import vn.tphcm.identityservice.dtos.response.UserStatisticsResponse;

import java.util.Map;

public interface UserService {
    ApiResponse<PageResponse<InfoUserResponse>> getAllUsers(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<UserStatisticsResponse> getUserStatistics();

    ApiResponse<Void> updateStatusUser(String userId, UserStatus status);
}
