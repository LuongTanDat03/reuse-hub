/*
 * @ (#) NotificationMessage.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationMessage {
    private String recipientUserId;
    private String title;
    private String message;
    private String type;
    private String itemId;
    private String transactionId;
    private Object data;
}
