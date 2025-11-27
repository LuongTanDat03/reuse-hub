/*
 * @ (#) AdminService.java       1.0     11/25/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 11/25/2025
 */

import vn.tphcm.adminservice.dto.ApiResponse;
import vn.tphcm.adminservice.dto.PageResponse;
import vn.tphcm.adminservice.dto.response.*;

import java.util.Map;

public interface AdminService {
    ApiResponse<DashboardUserResponse> getAllUsers(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<DashboardItemResponse> getAllItems(int pageNo, int pageSize, String sortBy, String sortDirection, String filter);

    ApiResponse<DashboardTransactionResponse> getAllTransactions(int pageNo, int pageSize, String sortBy, String sortDirection);

    ApiResponse<Void> disableUser(String userId);

    ApiResponse<Void> enableUser(String userId);

    ApiResponse<Void> resetPassword(String userId);

    ApiResponse<Void> deleteItem(String itemId);
}
