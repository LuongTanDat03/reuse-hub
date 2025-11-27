/*
 * @ (#) ProfileMapper.java       1.0     8/31/2025
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
import vn.tphcm.identityservice.dtos.request.ProfileUserRequest;
import vn.tphcm.identityservice.dtos.request.UserCreationRequest;
import vn.tphcm.identityservice.dtos.response.InfoUserResponse;
import vn.tphcm.identityservice.models.User;

@Mapper(componentModel = "spring", uses = {AddressMapper.class})
public interface ProfileMapper {
    @Mapping(target = "userId", ignore = true)
    ProfileUserRequest toRegisterRequest(UserCreationRequest request);

    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "address", ignore = true)
    InfoUserResponse toInfoProfile(User user);
}
