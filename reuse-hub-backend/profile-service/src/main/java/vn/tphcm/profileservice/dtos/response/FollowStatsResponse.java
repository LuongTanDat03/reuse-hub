/*
 * @ (#) FollowStatsResponse.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.dtos.response;

import lombok.*;

/*
 * @author: AI Assistant
 * @date: 11/30/2025
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowStatsResponse {
    private long followersCount;
    private long followingCount;
}
