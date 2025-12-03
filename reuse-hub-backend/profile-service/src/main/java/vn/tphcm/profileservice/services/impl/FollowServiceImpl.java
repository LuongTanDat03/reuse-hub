/*
 * @ (#) FollowServiceImpl.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services.impl;

/*
 * @author: Luong Tan Dat
 * @date: 11/30/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.response.FollowStatsResponse;
import vn.tphcm.profileservice.dtos.response.UserSummaryResponse;
import vn.tphcm.profileservice.exceptions.InvalidDataException;
import vn.tphcm.profileservice.exceptions.ResourceNotFoundException;
import vn.tphcm.profileservice.models.Follow;
import vn.tphcm.profileservice.models.User;
import vn.tphcm.profileservice.repositories.FollowRepository;
import vn.tphcm.profileservice.repositories.UserRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "FOLLOW-SERVICE")
public class FollowServiceImpl implements vn.tphcm.profileservice.services.FollowService {
    
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public ApiResponse<Void> followUser(String followerId, String followingId) {
        log.info("FollowService - followUser: followerId={}, followingId={}", followerId, followingId);
        
        if (followerId.equals(followingId)) {
            throw new InvalidDataException("Cannot follow yourself");
        }

        verifyUserExists(followerId);
        verifyUserExists(followingId);

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new InvalidDataException("Already following this user");
        }
        
        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();
        
        followRepository.save(follow);
        
        log.info("User {} successfully followed user {}", followerId, followingId);
        
        return ApiResponse.<Void>builder()
                .status(CREATED.value())
                .message("Successfully followed user")
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    @Override
    @Transactional
    public ApiResponse<Void> unfollowUser(String followerId, String followingId) {
        log.info("FollowService - unfollowUser: followerId={}, followingId={}", followerId, followingId);
        
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow relationship not found"));
        
        followRepository.delete(follow);
        
        log.info("User {} successfully unfollowed user {}", followerId, followingId);
        
        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Successfully unfollowed user")
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowers(String userId, String currentUserId, int pageNo, int pageSize) {
        log.info("FollowService - getFollowers: userId={}, pageNo={}, pageSize={}", userId, pageNo, pageSize);
        
        verifyUserExists(userId);
        
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Follow> followPage = followRepository.findByFollowingId(userId, pageable);
        
        List<String> followerIds = followPage.getContent().stream()
                .map(Follow::getFollowerId)
                .toList();
        
        List<User> followers = userRepository.findByUserIdIn(followerIds);
        
        // Get following status if currentUserId is provided
        // Check if current user is following any of the followers
        Set<String> currentUserFollowing = Set.of();
        if (currentUserId != null && !currentUserId.isEmpty() && !followerIds.isEmpty()) {
            // Only check for the specific users in this page to avoid loading all following
            List<String> followingInPage = followerIds.stream()
                    .filter(followerId -> followRepository.existsByFollowerIdAndFollowingId(currentUserId, followerId))
                    .toList();
            currentUserFollowing = Set.copyOf(followingInPage);
        }
        
        Set<String> finalCurrentUserFollowing = currentUserFollowing;
        List<UserSummaryResponse> summaries = followers.stream()
                .map(user -> mapToUserSummary(user, finalCurrentUserFollowing.contains(user.getUserId())))
                .toList();
        
        PageResponse<UserSummaryResponse> pageResponse = PageResponse.<UserSummaryResponse>builder()
                .content(summaries)
                .pageNo(followPage.getNumber())
                .pageSize(followPage.getSize())
                .totalElements(followPage.getTotalElements())
                .totalPages(followPage.getTotalPages())
                .last(followPage.isLast())
                .build();
        
        return ApiResponse.<PageResponse<UserSummaryResponse>>builder()
                .status(OK.value())
                .message("Fetched followers successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowing(String userId, String currentUserId, int pageNo, int pageSize) {
        log.info("FollowService - getFollowing: userId={}, pageNo={}, pageSize={}", userId, pageNo, pageSize);
        
        verifyUserExists(userId);
        
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Follow> followPage = followRepository.findByFollowerId(userId, pageable);
        
        List<String> followingIds = followPage.getContent().stream()
                .map(Follow::getFollowingId)
                .toList();
        
        List<User> following = userRepository.findByUserIdIn(followingIds);
        
        // Get following status if currentUserId is provided
        // Check if current user is following any of the users in following list
        Set<String> currentUserFollowing = Set.of();
        if (currentUserId != null && !currentUserId.isEmpty() && !followingIds.isEmpty()) {
            // Only check for the specific users in this page to avoid loading all following
            List<String> followingInPage = followingIds.stream()
                    .filter(followingId -> followRepository.existsByFollowerIdAndFollowingId(currentUserId, followingId))
                    .toList();
            currentUserFollowing = Set.copyOf(followingInPage);
        }
        
        Set<String> finalCurrentUserFollowing = currentUserFollowing;
        List<UserSummaryResponse> summaries = following.stream()
                .map(user -> mapToUserSummary(user, finalCurrentUserFollowing.contains(user.getUserId())))
                .toList();
        
        PageResponse<UserSummaryResponse> pageResponse = PageResponse.<UserSummaryResponse>builder()
                .content(summaries)
                .pageNo(followPage.getNumber())
                .pageSize(followPage.getSize())
                .totalElements(followPage.getTotalElements())
                .totalPages(followPage.getTotalPages())
                .last(followPage.isLast())
                .build();
        
        return ApiResponse.<PageResponse<UserSummaryResponse>>builder()
                .status(OK.value())
                .message("Fetched following successfully")
                .data(pageResponse)
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<FollowStatsResponse> getFollowStats(String userId) {
        log.info("FollowService - getFollowStats: userId={}", userId);
        
        verifyUserExists(userId);
        
        long followersCount = followRepository.countFollowers(userId);
        long followingCount = followRepository.countFollowing(userId);
        
        FollowStatsResponse stats = FollowStatsResponse.builder()
                .followersCount(followersCount)
                .followingCount(followingCount)
                .build();
        
        return ApiResponse.<FollowStatsResponse>builder()
                .status(OK.value())
                .message("Fetched follow stats successfully")
                .data(stats)
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Boolean> isFollowing(String followerId, String followingId) {
        log.info("FollowService - isFollowing: followerId={}, followingId={}", followerId, followingId);
        
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        
        return ApiResponse.<Boolean>builder()
                .status(OK.value())
                .message("Checked follow status successfully")
                .data(isFollowing)
                .timestamp(OffsetDateTime.now())
                .build();
    }
    
    private void verifyUserExists(String userId) {
        if (userRepository.findByUserId(userId).isEmpty()) {
            throw new ResourceNotFoundException("User not found with userId: " + userId);
        }
    }
    
    private UserSummaryResponse mapToUserSummary(User user, boolean isFollowing) {
        return UserSummaryResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .ratingAverage(user.getRatingAverage())
                .ratingCount(user.getRatingCount())
                .isFollowing(isFollowing)
                .build();
    }
}
