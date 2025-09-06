/*
 * @ (#) UserContext.java       1.0     9/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.context;
/*
 * @author: Luong Tan Dat
 * @date: 9/2/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserContext {
    private String userId;
    private String username;
    private List<String> roles;
    private List<String> permissions;
}
