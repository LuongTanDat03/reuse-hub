/*
 * @ (#) AddressRequest.java       1.0     8/15/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/15/2025
 */

import lombok.Getter;

@Getter
public class AddressRequest {
    private String addressLine;
    private String ward;
    private String district;
    private String city;
    private String country;
}
