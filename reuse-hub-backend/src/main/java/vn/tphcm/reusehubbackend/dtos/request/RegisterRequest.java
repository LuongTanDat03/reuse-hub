/*
 * @ (#) RegisterRequest.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import lombok.Getter;
import vn.tphcm.reusehubbackend.commons.Gender;

import java.time.LocalDate;
import java.util.List;

@Getter
public class RegisterRequest {
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
