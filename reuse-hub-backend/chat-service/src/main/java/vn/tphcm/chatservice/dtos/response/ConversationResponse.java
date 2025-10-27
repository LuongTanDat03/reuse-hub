/*
 * @ (#) ConversationResponse.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import lombok.*;
import vn.tphcm.chatservice.commons.ConversationStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {
    private String id;

    private List<String> participants;

    private String participantsKey;

    private ConversationType type;

    private String lastMessageId;

    private LocalDateTime lastActivity;

    private ConversationStatus status;

    private List<String> pinnedMessages;

    private Map<String, Boolean> mutedStatus;

    private Map<String, Boolean> notificationSettings;
}
