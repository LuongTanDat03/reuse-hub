/*
 * @ (#) FollowController.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.response.FollowStatsResponse;
import vn.tphcm.profileservice.dtos.response.UserSummaryResponse;
import vn.tphcm.profileservice.services.FollowService;

/*
 * @author: AI Assistant
 * @date: 11/30/2025
 */

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
@Slf4j(topic = "FOLLOW-CONTROLLER")
@Tag(name = "Follow Management", description = "APIs for managing user follows")
public class FollowController {
    
    private final FollowService followService;
    
    @PostMapping("/{userId}/follow")
    @Operation(summary = "Follow a user", description = "Current user follows another user")
    public ApiResponse<Void> followUser(
            @RequestHeader("X-User-Id") String currentUserId,
            @PathVariable String userId) {
        log.info("FollowController - followUser: currentUserId={}, targetUserId={}", currentUserId, userId);
        return followService.followUser(currentUserId, userId);
    }
    
    @DeleteMapping("/{userId}/follow")
    @Operation(summary = "Unfollow a user", description = "Current user unfollows another user")
    public ApiResponse<Void> unfollowUser(
            @RequestHeader("X-User-Id") String currentUserId,
            @PathVariable String userId) {
        log.info("FollowController - unfollowUser: currentUserId={}, targetUserId={}", currentUserId, userId);
        return followService.unfollowUser(currentUserId, userId);
    }
    
    @GetMapping("/{userId}/followers")
    @Operation(summary = "Get user followers", description = "Get paginated list of user's followers")
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowers(
            @PathVariable String userId,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("FollowController - getFollowers: userId={}, pageNo={}, pageSize={}", userId, pageNo, pageSize);
        return followService.getFollowers(userId, currentUserId, pageNo, pageSize);
    }
    
    @GetMapping("/{userId}/following")
    @Operation(summary = "Get user following", description = "Get paginated list of users that this user follows")
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowing(
            @PathVariable String userId,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("FollowController - getFollowing: userId={}, pageNo={}, pageSize={}", userId, pageNo, pageSize);
        return followService.getFollowing(userId, currentUserId, pageNo, pageSize);
    }
    
    @GetMapping("/{userId}/follow-stats")
    @Operation(summary = "Get follow statistics", description = "Get follower and following counts for a user")
    public ApiResponse<FollowStatsResponse> getFollowStats(@PathVariable String userId) {
        log.info("FollowController - getFollowStats: userId={}", userId);
        return followService.getFollowStats(userId);
    }
    
    @GetMapping("/{userId}/is-following")
    @Operation(summary = "Check if following", description = "Check if current user is following another user")
    public ApiResponse<Boolean> isFollowing(
            @RequestHeader("X-User-Id") String currentUserId,
            @PathVariable String userId) {
        log.info("FollowController - isFollowing: currentUserId={}, targetUserId={}", currentUserId, userId);
        return followService.isFollowing(currentUserId, userId);
    }
}
