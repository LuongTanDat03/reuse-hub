/*
 * @ (#) UserMapper.java       1.0     8/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 8/31/2025
 */

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.identityservice.dtos.request.UserCreationRequest;
import vn.tphcm.identityservice.dtos.response.UserResponse;
import vn.tphcm.identityservice.models.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toUser(UserCreationRequest request);

    @Mapping(target = "password", ignore = true)
    UserResponse toUserResponse(User user);
}
