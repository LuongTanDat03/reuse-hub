/*
 * @ (#) LocaResponse.java       1.0     9/19/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/19/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationResponse {
    private Double latitude;
    private Double longitude;
}
