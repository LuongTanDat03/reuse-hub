/*
 * @ (#) NotificationEvent.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import lombok.*;
import vn.tphcm.event.commons.EventType;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationMessage {
    private String notificationId;
    private String recipientId;
    private String title;
    private String content;
    private EventType type;
    private String actorUserId;
    private Map<String, String> data;
}
