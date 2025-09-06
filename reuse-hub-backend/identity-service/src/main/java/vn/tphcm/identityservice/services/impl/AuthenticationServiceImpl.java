/*
 * @ (#) AuthenticationServiceImpl.java       1.0     8/15/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/15/2025
 */

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vn.tphcm.event.dto.VerificationMessage;
import vn.tphcm.identityservice.commons.TokenType;
import vn.tphcm.identityservice.commons.UserStatus;
import vn.tphcm.identityservice.dtos.request.IntrospectRequest;
import vn.tphcm.identityservice.dtos.request.SignInRequest;
import vn.tphcm.identityservice.dtos.request.UserCreationRequest;
import vn.tphcm.identityservice.dtos.response.IntrospectResponse;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.response.SignInResponse;
import vn.tphcm.identityservice.dtos.response.UserResponse;
import vn.tphcm.identityservice.exceptions.InvalidDataException;
import vn.tphcm.identityservice.exceptions.ResourceNotFoundException;
import vn.tphcm.identityservice.mapper.ProfileMapper;
import vn.tphcm.identityservice.mapper.UserMapper;
import vn.tphcm.identityservice.models.User;
import vn.tphcm.identityservice.repositories.UserRepository;
import vn.tphcm.identityservice.repositories.client.ProfileClient;
import vn.tphcm.identityservice.services.AuthenticationService;
import vn.tphcm.identityservice.services.JwtService;
import vn.tphcm.identityservice.services.MessageProducer;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.util.concurrent.TimeUnit.MINUTES;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTHENTICATION-SERVICE")
public class AuthenticationServiceImpl implements AuthenticationService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ProfileClient profileClient;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final MessageProducer messageProducer;
    private final RedisTemplate<String, String> redisTemplate;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final int TIMEOUT_REDIS = 5 * 60;
    private final ProfileMapper profileMapper;

    @Value("${avatar.default}")
    private String avatarUrl;

    @Override
    public ApiResponse<SignInResponse> getAccessToken(SignInRequest request) {
        log.info("Get Access Token");

        List<String> authorities = new ArrayList<>();
        try {
            log.info("Username: {},Password: {}", request.getUsernameOrEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));

            log.info("Authentication successful for user: {}", request.getUsernameOrEmail());
            log.info("Authorities: {}", authentication.getAuthorities());
            authorities.add(authentication.getAuthorities().toString());

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (BadCredentialsException e) {
            log.error("Authentication failed for user: {}", request.getUsernameOrEmail(), e);
            throw new AccessDeniedException("Invalid username or password");
        } catch (DisabledException e) {
            log.error("Account disabled: {}", e.getMessage());
            throw new AccessDeniedException("Account is disabled");
        } catch (Exception e) {
            log.error("Unexpected error during login: {}", e.getMessage());
            throw new AccessDeniedException("Login failed");
        }

        String accessToken = jwtService.generateAccessToken(request.getUsernameOrEmail(), authorities);
        log.info("Generated access token: {}", accessToken.substring(0, 7));

        String refreshToken = jwtService.generateRefreshToken(request.getUsernameOrEmail(), authorities);
        log.info("Generated refresh token: {}", refreshToken.substring(0, 7));

        return ApiResponse.<SignInResponse>builder().status(HttpStatus.OK.value()).message("Sign In Successfully").data(SignInResponse.builder().accessToken(accessToken).refreshToken(refreshToken).usernameOrEmail(request.getUsernameOrEmail()).build()).timestamp(OffsetDateTime.now()).build();
    }

    @Override
    public ApiResponse<SignInResponse> getRefreshToken(String refreshToken) {
        log.info("Get Refresh Token");

        if (StringUtils.hasLength(refreshToken)) {
            throw new InvalidDataException("Invalid refresh token");
        }

        try {
            // Verify token
            String username = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);
            log.info("Extracted username from refresh token: {}", username);

            // Check user is active or inactivated
            User user = userRepository.findByUsername(username);

            List<String> authorities = new ArrayList<>();
            user.getAuthorities().forEach(authority -> authorities.add(authority.getAuthority()));

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(username, authorities);
            log.info("Generated new access token: {}", newAccessToken.substring(0, 7));

            return ApiResponse.<SignInResponse>builder().status(HttpStatus.OK.value()).message("Refresh token successfully").data(SignInResponse.builder().accessToken(newAccessToken).refreshToken(refreshToken).build()).timestamp(OffsetDateTime.now()).build();
        } catch (Exception e) {
            log.error("Error generating refresh token: {}", e.getMessage());
            throw new AccessDeniedException("Failed to refresh token");
        }
    }

    @Override
    public ApiResponse<UserResponse> register(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus(UserStatus.PENDING);

        try {
            user = userRepository.save(user);
            log.info("Create user successfully: {}", user.getId());
        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation: {}", e.getMessage());
            throw new DataIntegrityViolationException("Username or Email already exists");
        }

        var profileRequest = profileMapper.toRegisterRequest(request);
        profileRequest.setUserId(user.getId());

        var profile = profileClient.createProfile(profileRequest);

        // Generate verification code
        String verifyCode = generateCode();

        // Save verifyCode in Redis with a TTL of 5 minutes
        String redisKey = "verifyCode:" + user.getId();
        redisTemplate.opsForValue().set(redisKey, verifyCode, TIMEOUT_REDIS, MINUTES);
        log.info("Stored verifyCode in Redis with key: {}, code: {}", redisKey, verifyCode);

        // Send verification message to RabbitMQ Exchange
        VerificationMessage message = VerificationMessage.of(user.getEmail(), user.getId(), verifyCode);

        messageProducer.publishVerificationEmail(message);
        log.info("📨 Verification email message sent for userId={}, email={}", user.getId(), user.getEmail());

        var userCreationResponse = userMapper.toUserResponse(user);
        userCreationResponse.setId(profile.getData().getId());

        return ApiResponse.<UserResponse>builder().status(HttpStatus.CREATED.value()).message("User registered successfully, Please check your email to verify your account.").data(userCreationResponse).timestamp(OffsetDateTime.now()).build();
    }

    @Override
    public ApiResponse<Void> logout() {
        // Get the current authentication from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("User is not authenticated");
            throw new AccessDeniedException("User is not authenticated");
        }

        String username = authentication.getName();

        // Check if user exists
        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.error("User not found with username: {}", username);
            throw new ResourceNotFoundException("User not found");
        }

        // Delete the access token from Redis
        String redisKey = "accessToken:" + user.getId();
        jwtService.deleteToken(redisKey);

        // Clear the security context
        SecurityContextHolder.clearContext();

        return ApiResponse.<Void>builder().status(HttpStatus.OK.value()).message("Logout successful").data(null).timestamp(OffsetDateTime.now()).build();
    }

    @Override
    public ApiResponse<UserResponse> verifyEmail(String userId, String verificationCode) {
        Optional<User> userOptional = userRepository.findById(userId);

        // Check if user exists
        if (userOptional.isEmpty()) {
            log.error("User not found with ID: {}", userId);
            throw new ResourceNotFoundException("User not found");
        }

        // Check if user is already active
        if (userOptional.get().getStatus() == UserStatus.ACTIVE) {
            log.warn("User with ID: {} is already active", userId);
            return ApiResponse.<UserResponse>builder().status(HttpStatus.OK.value()).message("User is already active").data(null).timestamp(OffsetDateTime.now()).build();
        }

        // Check verification code in Redis
        String redisKey = "verifyCode:" + userId;
        String storedCode = redisTemplate.opsForValue().get(redisKey);
        if (storedCode == null || !storedCode.equals(verificationCode)) {
            log.error("Invalid verification code for user ID: {}", userId);
            throw new AccessDeniedException("Invalid verification code");
        }

        // Set user status to ACTIVE
        userOptional.get().setStatus(UserStatus.ACTIVE);
        userRepository.save(userOptional.get());
        log.info("User with ID: {} has been verified and activated", userId);

        // Remove the verification code from Redis
        redisTemplate.delete(redisKey);

        return ApiResponse.<UserResponse>builder().status(HttpStatus.OK.value()).message("User verified successfully").data(userMapper.toUserResponse(userOptional.get())).timestamp(OffsetDateTime.now()).build();
    }

    @Override
    public ApiResponse<IntrospectResponse> introspect(IntrospectRequest request) {
        try {
            boolean isTokenValid = jwtService.isTokenValid(request.getToken(), TokenType.ACCESS_TOKEN);

            if (!isTokenValid) {
                return ApiResponse.<IntrospectResponse>builder().status(HttpStatus.OK.value()).message("Token is invalid").data(IntrospectResponse.builder().userId(null).username(null).roles(null).permissions(null).valid(false).build()).timestamp(OffsetDateTime.now()).build();
            }

            String userId = jwtService.extractUsername(request.getToken(), TokenType.ACCESS_TOKEN);

            User user = userRepository.findById(userId).orElseThrow(() -> {
                log.error("User not found with ID: {}", userId);
                return new ResourceNotFoundException("User not found");
            });
            
            return ApiResponse.<IntrospectResponse>builder()
                    .status(HttpStatus.OK.value())
                    .message("Token is valid")
                    .data(IntrospectResponse.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .roles(jwtService.extractAuthorities(request.getToken(), TokenType.ACCESS_TOKEN))
                            .permissions(List.of())
                            .valid(true)
                            .build())
                    .timestamp(OffsetDateTime.now()).build();
        } catch (Exception e) {
            log.error("Error introspecting token: {}", e.getMessage());
            return ApiResponse.<IntrospectResponse>builder().status(HttpStatus.OK.value()).message("Token is invalid").data(IntrospectResponse.builder().userId(null).username(null).roles(null).permissions(null).valid(false).build()).timestamp(OffsetDateTime.now()).build();
        }
    }

    public String generateCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        return code.toString();
    }

}
