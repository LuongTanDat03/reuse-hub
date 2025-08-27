/*
 * @ (#) IntrospectReponse.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.userservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntrospectReponse {
    private boolean valid;
}
