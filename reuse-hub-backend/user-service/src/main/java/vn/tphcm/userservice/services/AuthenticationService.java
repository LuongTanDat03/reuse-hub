/*
 * @ (#) AuthenticationService.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.userservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.userservice.dtos.request.IntrospectRequest;
import vn.tphcm.userservice.dtos.request.RegisterRequest;
import vn.tphcm.userservice.dtos.request.SignInRequest;
import vn.tphcm.userservice.dtos.response.MessageResponse;

@Service
public interface AuthenticationService {
    MessageResponse getAccessToken(SignInRequest request);

    MessageResponse getRefreshToken(String token);

    MessageResponse register(RegisterRequest request);

    MessageResponse logout();

    MessageResponse verifyEmail(Long userId, String token);

    MessageResponse introspect(IntrospectRequest request);
}
