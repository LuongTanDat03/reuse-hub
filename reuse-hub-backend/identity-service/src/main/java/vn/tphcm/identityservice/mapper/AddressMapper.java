/*
 * @ (#) AddressMapper.java       1.0     9/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 9/3/2025
 */

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.identityservice.dtos.request.AddressRequest;
import vn.tphcm.identityservice.dtos.request.ProfileAddressRequest;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "addressId", ignore = true)
    ProfileAddressRequest toProfileAddressRequest(AddressRequest request);
}
