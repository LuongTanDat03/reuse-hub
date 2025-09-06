/*
 * @ (#) UserServiceImpl.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.tphcm.profileservice.dtos.request.ProfileAddressRequest;
import vn.tphcm.profileservice.dtos.request.ProfileUserRequest;
import vn.tphcm.profileservice.dtos.response.UserResponse;
import vn.tphcm.profileservice.mapper.AddressMapper;
import vn.tphcm.profileservice.mapper.UserMapper;
import vn.tphcm.profileservice.models.Address;
import vn.tphcm.profileservice.models.User;
import vn.tphcm.profileservice.repositories.AddressRepository;
import vn.tphcm.profileservice.repositories.UserRepository;
import vn.tphcm.profileservice.services.ProfileService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "USER-SERVICE")
public class ProfileServiceImpl implements ProfileService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;

    @Override
    public UserResponse createProfile(ProfileUserRequest request) {
        User user = userMapper.toUser(request);

        final User finalUser = userRepository.save(user);

        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            List<Address> addresses = request.getAddress().stream()
                    .map(address -> {
                        Address addr = addressMapper.toAddress(address);
                        addr.setUser(finalUser);
                        return addr;
                    })
                    .toList();
            addressRepository.saveAll(addresses);

            finalUser.setAddress(addresses);
        }
        return userMapper.toResponse(user);
    }
}
