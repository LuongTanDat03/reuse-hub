/*
 * @ (#) IntrospectResponse.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.apigateway.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.*;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityResponse {
    private boolean valid;
}
