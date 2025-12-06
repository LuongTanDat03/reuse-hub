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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.request.ProfileAddressRequest;
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
import vn.tphcm.profileservice.services.ProfileService;
import vn.tphcm.profileservice.services.SupabaseStorageService;

import java.time.OffsetDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class ProfileServiceImpl implements ProfileService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;
    private final SupabaseStorageService supabaseStorageService;

    @Value("${avatar.default}")
    private String avatar;

    @Override
    @Transactional
    public ApiResponse<UserResponse> createProfile(ProfileUserRequest request) {
        User user = userMapper.toUser(request);

        user.setAvatarUrl(avatar);
        user.setWallet(0L);
        User savedUser = userRepository.save(user);

        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            setAddressMapper(user, request.getAddress());
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
                .status(OK.value())
                .message("Get profile successfully")
                .data(userMapper.toProfileResponse(user))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ProfileResponse> updateProfile(ProfileUpdateRequest request, MultipartFile file) {
        User user = getUserId(request.getUserId());

        userMapper.update(user, request);

        if (request.getAddress() != null) {
            setAddressMapper(user, request.getAddress());
        }

        if(file != null && !file.isEmpty()) {
            String imageUrl = supabaseStorageService.uploadImage(file, "avatars").getImageUrl();
            log.info("Uploaded avatar image URL: {}", imageUrl);

            user.setAvatarUrl(imageUrl);
        }

        User savedUser = userRepository.save(user);

        return ApiResponse.<ProfileResponse>builder()
                .status(OK.value())
                .message("Update profile successfully")
                .data(userMapper.toProfileResponse(savedUser))
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<List<ProfileResponse>> getProfilesByUserIds(List<String> userIds) {
        List<User> users = userRepository.findByUserIdIn(userIds);

        List<ProfileResponse> profiles = users.stream()
                .map(userMapper::toProfileResponse)
                .toList();

        return ApiResponse.<List<ProfileResponse>>builder()
                .status(OK.value())
                .message("Get profiles successfully")
                .data(profiles)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Long> getWalletBalance(String userId) {
        User user = getUserId(userId);
        
        return ApiResponse.<Long>builder()
                .status(OK.value())
                .message("Get wallet balance successfully")
                .data(user.getWallet())
                .timestamp(OffsetDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Long> getTotalWalletBalance() {
        List<User> allUsers = userRepository.findAll();
        Long totalBalance = allUsers.stream()
                .mapToLong(User::getWallet)
                .sum();
        
        log.info("Total wallet balance across {} users: {}", allUsers.size(), totalBalance);
        
        return ApiResponse.<Long>builder()
                .status(OK.value())
                .message("Get total wallet balance successfully")
                .data(totalBalance)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    private void setAddressMapper(User user, List<ProfileAddressRequest> addresses) {
         List<Address> address = addresses.stream()
                    .map(dto -> {
                        Address addr = addressMapper.toAddress(dto);
                        addr.setUser(user);
                        return addr;
                    })
                    .toList();

            user.replaceAddresses(address);

            addressRepository.saveAll(address);
    }

    private User getUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    log.error("User not found with userId: {}", userId);
                    return new ResourceNotFoundException("User not found with userId: " + userId);
                });
    }
}
