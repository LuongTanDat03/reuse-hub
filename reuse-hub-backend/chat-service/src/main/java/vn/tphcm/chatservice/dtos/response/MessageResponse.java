/*
 * @ (#) MessageResponse.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import lombok.*;
import vn.tphcm.chatservice.commons.MessageStatus;
import vn.tphcm.chatservice.commons.MessageType;
import vn.tphcm.chatservice.commons.ReactionType;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private String id;

    private String conversationId;

    private String senderId;

    private String content;

    private String contentBeforeEditOrDelete;

    private String replyToMessageId;

    private List<String> media;

    private MessageStatus status;

    private MessageType type;

    private EnumMap<ReactionType, List<String>> reactions;

    private List<String> deletedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
