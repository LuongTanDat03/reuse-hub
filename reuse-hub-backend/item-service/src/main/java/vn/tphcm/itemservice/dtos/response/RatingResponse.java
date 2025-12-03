/*
 * @ (#) RatingResponse.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingResponse {
    private String userId;
    private Double rating;
}
