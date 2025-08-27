/*
 * @ (#) IntrospectRequest.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IdentityRequest {
    private String token;
}
