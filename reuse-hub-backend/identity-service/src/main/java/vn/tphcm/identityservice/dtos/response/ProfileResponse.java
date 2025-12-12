/*
 * @ (#) ProfileResponse.java       1.0     9/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/17/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private String userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String avatarUrl;

    private Long wallet;

    private List<AddressResponse> address;
}
