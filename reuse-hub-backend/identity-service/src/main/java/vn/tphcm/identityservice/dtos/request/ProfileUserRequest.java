/*
 * @ (#) RegisterRequest.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import lombok.Getter;
import lombok.Setter;
import vn.tphcm.identityservice.commons.Gender;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
public class ProfileUserRequest {
    private String userId;

    private String firstName;

    private String lastName;

    private String phone;

    private String email;

    private Gender gender;

    private LocalDate birthday;

    private String username;

    private String password;

    private List<ProfileAddressRequest> address;
}
