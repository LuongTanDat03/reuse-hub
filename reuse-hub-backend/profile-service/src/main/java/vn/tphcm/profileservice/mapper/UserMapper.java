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

import org.mapstruct.*;
import vn.tphcm.profileservice.dtos.request.ProfileUpdateRequest;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.ProfileResponse;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.models.User;

@Mapper(componentModel = "spring", uses = { AddressMapper.class})
public interface UserMapper {
    @Mapping(source = "address", target = "address")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(ProfileUserRequest request);

    @Mapping(target = "userRoles", ignore = true)
    UserResponse toResponse(User user);

    ProfileResponse toProfileResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget User user, ProfileUpdateRequest request);
}
