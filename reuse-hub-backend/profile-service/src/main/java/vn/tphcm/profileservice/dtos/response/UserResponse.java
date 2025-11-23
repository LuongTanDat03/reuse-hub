/*
 * @ (#) UserResponse.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UserResponse {
    private String id;

    private String userId;

    private String phone;

    private String email;

    private String username;

    private String password;

    private Set<UserHasRoleResponse> userRoles;
}
