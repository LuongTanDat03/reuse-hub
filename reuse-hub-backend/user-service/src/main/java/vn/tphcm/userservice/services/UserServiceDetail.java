/*
 * @ (#) UserServiceDetail.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.userservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.hibernate.boot.model.naming.IllegalIdentifierException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import vn.tphcm.userservice.repositories.UserRepository;

@Service
public record UserServiceDetail(UserRepository userRepository) {
   public UserDetailsService userDetailsService() {
        return usernameOrEmail -> userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new IllegalIdentifierException("User not found with username or email: " + usernameOrEmail));
    }

}
