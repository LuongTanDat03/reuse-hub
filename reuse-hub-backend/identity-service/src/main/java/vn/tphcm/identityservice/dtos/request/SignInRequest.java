/*
 * @ (#) SignInRequest.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import lombok.Getter;

@Getter
public class SignInRequest {
    private String usernameOrEmail;
    private String password;
}
