/*
 * @ (#) UserService.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */


import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.UserResponse;

public interface ProfileService {
    UserResponse createProfile(ProfileUserRequest request);
}
