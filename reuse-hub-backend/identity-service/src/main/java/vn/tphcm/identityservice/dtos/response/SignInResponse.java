/*
 * @ (#) SignInResponse.java       1.0     8/15/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 8/15/2025
 */

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SignInResponse {
    private String accessToken;
    private String refreshToken;
    private String usernameOrEmail;
    private String userId;
}
