/*
 * @ (#) AuthenticationService.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.identityservice.dtos.request.IntrospectRequest;
import vn.tphcm.identityservice.dtos.request.LogoutRequest;
import vn.tphcm.identityservice.dtos.request.SignInRequest;
import vn.tphcm.identityservice.dtos.request.UserCreationRequest;
import vn.tphcm.identityservice.dtos.ApiResponse;
import vn.tphcm.identityservice.dtos.response.IntrospectResponse;
import vn.tphcm.identityservice.dtos.response.SignInResponse;
import vn.tphcm.identityservice.dtos.response.UserResponse;

@Service
public interface AuthenticationService {
    ApiResponse<SignInResponse> getAccessToken(SignInRequest request);

    ApiResponse<SignInResponse> getRefreshToken(String token);

    ApiResponse<UserResponse> register(UserCreationRequest request);

    ApiResponse<Void> logout(LogoutRequest request);

    ApiResponse<UserResponse> verifyEmail(String userId, String token);

    ApiResponse<IntrospectResponse> introspect(IntrospectRequest request);
}
