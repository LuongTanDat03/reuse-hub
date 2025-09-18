/*
 * @ (#) AddressMapper.java       1.0     9/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 9/6/2025
 */

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.profileservice.dtos.request.ProfileAddressRequest;
import vn.tphcm.profileservice.models.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    Address toAddress(ProfileAddressRequest request);
}
