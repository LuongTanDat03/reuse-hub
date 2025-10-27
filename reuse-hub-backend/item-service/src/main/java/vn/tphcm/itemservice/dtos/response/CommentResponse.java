/*
 * @ (#) CommentResponse.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private String userId;
    private String comment;
}
