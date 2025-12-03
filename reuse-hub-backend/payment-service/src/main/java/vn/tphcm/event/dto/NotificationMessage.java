/*
 * @ (#) NotificationMessage.java       1.0     9/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 9/22/2025
 */

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NotificationMessage {
    private String notificationId;

    private String recipientUserId;

    private String title;

    private String message;

    private String type;

    private String itemId;

    private String actorUserId;

    private Object data;
}
