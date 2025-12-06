/*
 * @ (#) UserService.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */


import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.request.ProfileUpdateRequest;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.ProfileResponse;
import vn.tphcm.profileservice.dtos.response.UserResponse;

import java.util.List;

public interface ProfileService {
    ApiResponse<UserResponse> createProfile(ProfileUserRequest request);

    ApiResponse<ProfileResponse> getProfile(String userId);

    ApiResponse<ProfileResponse> updateProfile(ProfileUpdateRequest request, MultipartFile file);

    ApiResponse<List<ProfileResponse>> getProfilesByUserIds(List<String> userIds);

    ApiResponse<Long> getWalletBalance(String userId);

    ApiResponse<Long> getTotalWalletBalance();
}
