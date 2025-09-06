/*
 * @ (#) UserMapper.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.mapper;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import org.mapstruct.Mapper;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.models.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(ProfileUserRequest request);

    UserResponse toResponse(User user);
}
