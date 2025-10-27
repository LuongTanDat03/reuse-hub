/*
 * @ (#) MessageRequest.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import lombok.Getter;

@Getter
public class SendMessageRequest {
    private String conversationId;

    private String senderId;

    private String content;

    private String replyToMessageId;
}
