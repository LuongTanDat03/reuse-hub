/*
 * @ (#) AddressResponse.java       1.0     9/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/6/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class AddressResponse {
    private String id;

    private String addressId;

    private String addressLine;

    private String ward;

    private String district;

    private String city;

    private String country;
}
