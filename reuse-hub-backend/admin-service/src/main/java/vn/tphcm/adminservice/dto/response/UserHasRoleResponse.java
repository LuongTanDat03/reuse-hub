/*
 * @ (#) UserHasRoleReponse.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserHasRoleResponse {
    private String userId;
    private String roleId;
}
