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
import vn.tphcm.profileservice.dtos.request.ProfileAddressRequest;
import vn.tphcm.profileservice.dtos.response.AddressResponse;
import vn.tphcm.profileservice.models.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    Address toAddress(ProfileAddressRequest request);
}
