/*
 * @ (#) UserCreationRequest.java       1.0     8/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/31/2025
 */

import lombok.Getter;
import vn.tphcm.identityservice.commons.Gender;

import java.time.LocalDate;
import java.util.List;

@Getter
public class UserCreationRequest {
    private String firstName;

    private String lastName;

    private String phone;

    private String email;

    private Gender gender;

    private LocalDate birthday;

    private String username;

    private String password;

    private List<AddressRequest> address;
}
