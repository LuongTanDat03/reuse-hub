/*
 * @ (#) FeedbackEvent.java       1.0     11/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 11/2/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackEvent {
    private String itemId;
    private String reviewerId;
    private Double rating;
    private String comment;
}
