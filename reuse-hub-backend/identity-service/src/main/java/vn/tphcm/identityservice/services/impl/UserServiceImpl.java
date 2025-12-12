/*
 * @ (#) UserService.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.tphcm.identityservice.clients.ProfileClient;
import vn.tphcm.identityservice.commons.UserStatus;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.PageResponse;
import vn.tphcm.identityservice.dtos.response.InfoUserResponse;
import vn.tphcm.identityservice.dtos.response.ProfileResponse;
import vn.tphcm.identityservice.dtos.response.UserStatisticsResponse;
import vn.tphcm.identityservice.mapper.ProfileMapper;
import vn.tphcm.identityservice.models.User;
import vn.tphcm.identityservice.repositories.UserRepository;
import vn.tphcm.identityservice.services.UserService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private final ProfileClient profileClient;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse<PageResponse<InfoUserResponse>> getAllUsers(int pageNo, int pageSize, String sortBy, String sortDirection) {
        Pageable pageable = createPageable(pageNo, pageSize, sortBy, sortDirection);

        Page<User> userPage = userRepository.findAll(pageable);

        List<String> userIds = userPage.getContent().stream()
                .map(User::getId)
                .toList();

        List<ProfileResponse> profiles = new ArrayList<>();

        try {
            var response = profileClient.getProfilesByUserIds(userIds);
            if (response.getData() != null) {
                profiles = response.getData();
            }
        } catch (Exception e) {
            log.error("Error fetching profiles from profile-service", e);
        }

        Map<String, ProfileResponse> profileMap = profiles.stream()
                .collect(Collectors.toMap(ProfileResponse::getUserId, profile -> profile));

        List<InfoUserResponse> content = userPage.getContent().stream().map(user ->
                {
                    InfoUserResponse response = profileMapper.toInfoProfile(user);

                    ProfileResponse profile = profileMap.get(user.getId());

                    if (profile != null) {
                        response.setFirstName(profile.getFirstName());
                        response.setLastName(profile.getLastName());
                        response.setAvatarUrl(profile.getAvatarUrl());
                        response.setEmail(profile.getEmail());
                        response.setWallet(profile.getWallet());
                    }
                    return response;
                }
        ).toList();

        PageResponse<InfoUserResponse> pageResponse = PageResponse.<InfoUserResponse>builder()
            .content(content)
            .pageNo(userPage.getNumber())
            .pageSize(userPage.getSize())
            .totalElements(userPage.getTotalElements())
            .totalPages(userPage.getTotalPages())
            .last(userPage.isLast())
            .build();

    return ApiResponse.<PageResponse<InfoUserResponse>>builder()
            .status(OK.value())
            .message("Get all users successfully")
            .data(pageResponse)
            .build();
    }

    @Override
    public ApiResponse<UserStatisticsResponse> getUserStatistics() {
        List<Object[]> results = userRepository.countUsersByStatus();
        Map<String, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            stats.put(result[0].toString(), (Long) result[1]);
        }

        return ApiResponse.<UserStatisticsResponse>builder()
                .status(OK.value())
                .message("Get user statistics successfully")
                .data(UserStatisticsResponse.builder()
                        .totalUsers(results.stream().mapToLong(r -> (Long) r[1]).sum())
                        .userStats(stats)
                        .build())
                .build();
    }

    @Override
    public ApiResponse<Void> updateStatusUser(String userId, UserStatus status) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setStatus(status);
            userRepository.save(user);
        });

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Update user status successfully")
                .data(null)
                .build();
    }

    @Override
    public ApiResponse<Void> resetPassword(String userId, String newPassword) {
        log.info("UserService - resetPassword: Resetting password for userId={}", userId);
        
        userRepository.findById(userId).ifPresent(user -> {
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);
            log.info("Password reset successfully for userId={}", userId);
        });

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Password reset successfully")
                .data(null)
                .build();
    }

    private Pageable createPageable(int pageNo, int pageSize, String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "createdAt");
        return PageRequest.of(pageNo, pageSize, sort);
    }
}
