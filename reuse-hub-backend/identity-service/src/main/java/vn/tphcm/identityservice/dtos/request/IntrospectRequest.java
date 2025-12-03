/*
 * @ (#) IntrospectRequest.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.Getter;

@Getter
public class IntrospectRequest {
    private String token;
}
