/*
 * @ (#) FollowService.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services;

import org.springframework.data.domain.Page;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.response.FollowStatsResponse;
import vn.tphcm.profileservice.dtos.response.UserSummaryResponse;

/*
 * @author: AI Assistant
 * @date: 11/30/2025
 */

public interface FollowService {
    
    ApiResponse<Void> followUser(String followerId, String followingId);
    
    ApiResponse<Void> unfollowUser(String followerId, String followingId);
    
    ApiResponse<PageResponse<UserSummaryResponse>> getFollowers(String userId, String currentUserId, int pageNo, int pageSize);
    
    ApiResponse<PageResponse<UserSummaryResponse>> getFollowing(String userId, String currentUserId, int pageNo, int pageSize);
    
    ApiResponse<FollowStatsResponse> getFollowStats(String userId);
    
    ApiResponse<Boolean> isFollowing(String followerId, String followingId);
}
