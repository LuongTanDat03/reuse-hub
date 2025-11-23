/*
 * @ (#) MessageEvent.java       1.0     10/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 10/13/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEvent {
    private String messageId;

    private String conversationId;

    private String senderId;

    private String content;

    private String eventType;

    private List<String> media;

    private String replyToMessageId;
}
