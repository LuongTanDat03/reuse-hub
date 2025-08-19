/*
 * @ (#) AuthenticationController.java       1.0     8/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 8/16/2025
 */

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.reusehubbackend.dtos.request.RegisterRequest;
import vn.tphcm.reusehubbackend.dtos.request.SignInRequest;
import vn.tphcm.reusehubbackend.dtos.response.MessageResponse;
import vn.tphcm.reusehubbackend.services.AuthenticationService;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "AUTHENTICATION-CONTROLLER")
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "Login to the application", description = "this endpoint allows users to log in and receive an access token.")
    public MessageResponse login(@RequestBody SignInRequest signInRequest) {
        log.info("Login request: {}", signInRequest);

        return authenticationService.getAccessToken(signInRequest);
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "This endpoint allows users to register and receive an access token.")
    public MessageResponse register(@RequestBody RegisterRequest request) {
        log.info("Refresh token request: {}", request);

        return authenticationService.register(request);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout from the application", description = "This endpoint allows users to log out and invalidate their access token.")
    public MessageResponse logout() {
        log.info("Logout request");

        return authenticationService.logout();
    }

    @PostMapping("/confirm")
    @Operation(summary = "Verify user email", description = "This endpoint allows users to verify their email address using a verification code.")
    public MessageResponse verifyEmail(@RequestParam("userId") Long userId, @RequestParam("verificationCode") String verificationCode) {
        log.info("Verify email request for userId: {}, verificationCode: {}", userId, verificationCode);

        return authenticationService.verifyEmail(userId, verificationCode);
    }
}

