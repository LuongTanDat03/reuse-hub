/*
 * @ (#) ProfileResponse.java       1.0     11/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 11/24/2025
 */

import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfoUserResponse {
    private String id;
    private String phone;
    private String email;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private Long wallet;
    private List<AddressResponse> address;
}
