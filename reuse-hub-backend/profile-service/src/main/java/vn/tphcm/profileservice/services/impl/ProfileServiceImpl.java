/*
 * @ (#) UserServiceImpl.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.request.ProfileUpdateRequest;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.ProfileResponse;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.exceptions.ResourceNotFoundException;
import vn.tphcm.profileservice.mapper.AddressMapper;
import vn.tphcm.profileservice.mapper.UserMapper;
import vn.tphcm.profileservice.models.Address;
import vn.tphcm.profileservice.models.User;
import vn.tphcm.profileservice.repositories.AddressRepository;
import vn.tphcm.profileservice.repositories.UserRepository;
import vn.tphcm.profileservice.services.AwsService;
import vn.tphcm.profileservice.services.ProfileService;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class ProfileServiceImpl implements ProfileService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;
    private final AwsService awsService;

    @Override
    @Transactional
    public ApiResponse<UserResponse> createProfile(ProfileUserRequest request) {
        User user = userMapper.toUser(request);

        User savedUser = userRepository.save(user);

        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            List<Address> addresses = request.getAddress().stream()
                    .map(address -> {
                        Address addr = addressMapper.toAddress(address);
                        addr.setUser(savedUser);
                        return addr;
                    })
                    .toList();

            savedUser.replaceAddresses(addresses);

            addressRepository.saveAll(addresses);
        }

        return ApiResponse.<UserResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Create profile successfully")
                .data(userMapper.toResponse(savedUser))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<ProfileResponse> getProfile(String userId) {
        User user = getUserId(userId);

        log.info("User found: {}", user);

        return ApiResponse.<ProfileResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Get profile successfully")
                .data(userMapper.toProfileResponse(user))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ProfileResponse> updateProfile(ProfileUpdateRequest request, MultipartFile file) {
        User user = getUserId(request.getUserId());

        if (file != null && !file.isEmpty()) {
            if (StringUtils.hasText(request.getAvatarUrl())) {
                awsService.deleteFile(user.getAvatarUrl());
            }

            String avatarUrl = awsService.uploadFile(file, "avatars");
            user.setAvatarUrl(avatarUrl);
        }

        userMapper.update(user, request);

        if (request.getAddress() != null) {
            List<Address> address = request.getAddress().stream()
                    .map(dto -> {
                        Address addr = addressMapper.toAddress(dto);
                        addr.setUser(user);
                        return addr;
                    })
                    .toList();

            user.replaceAddresses(address);

            addressRepository.saveAll(address);
        }

        User savedUser = userRepository.save(user);

        return ApiResponse.<ProfileResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Update profile successfully")
                .data(userMapper.toProfileResponse(savedUser))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    private User getUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("User not found with userId: {}", userId);
                    return new ResourceNotFoundException("User not found with userId: " + userId);
                });
    }
}
