/*
 * @ (#) AuthenticationService.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.reusehubbackend.dtos.request.RegisterRequest;
import vn.tphcm.reusehubbackend.dtos.request.SignInRequest;
import vn.tphcm.reusehubbackend.dtos.response.MessageResponse;

@Service
public interface AuthenticationService {
    MessageResponse getAccessToken(SignInRequest request);

    MessageResponse getRefreshToken(String token);

    MessageResponse register(RegisterRequest request);

    MessageResponse logout();

    MessageResponse verifyEmail(Long userId, String token);
}
