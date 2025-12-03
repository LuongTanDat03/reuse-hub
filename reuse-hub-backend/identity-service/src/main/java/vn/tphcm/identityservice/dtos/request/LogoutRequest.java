/*
 * @ (#) LogoutRequest.java       1.0     9/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 9/6/2025
 */

import lombok.Getter;

@Getter
public class LogoutRequest {
    private String token;
}
