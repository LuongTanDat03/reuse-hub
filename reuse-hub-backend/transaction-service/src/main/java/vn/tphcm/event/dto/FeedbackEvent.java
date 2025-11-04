/*
 * @ (#) FeedbackEvent.java       1.0     10/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 10/31/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackEvent {
    private String eventId;
    private String transactionId;
    private String itemId;
    private String reviewerId;
    private String sellerId;
    private String comment;
    private Double rating;
}
