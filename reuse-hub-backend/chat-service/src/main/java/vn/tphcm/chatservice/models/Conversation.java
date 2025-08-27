/*
 * @ (#) conversation.java       1.0     8/25/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/25/2025
 */

import jakarta.persistence.*;
import lombok.*;
import org.bson.types.ObjectId;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.tphcm.chatservice.commons.ConversationStatus;
import vn.tphcm.chatservice.commons.ConversationType;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@Builder
public class Conversation extends AbstractEntity<ObjectId> implements Serializable {

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "deputies")
    private List<Long> deputies;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ConversationType type;

    private String name;

    private String avatar;

    private List<String> members;

    @Column(name = "last_message_id")
    private String lastMessageId;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ConversationStatus status;

    private Map<String, String> views;

    @Column(name = "pinned_messages")
    private List<String> pinnedMessages;

    @Column(name = "muted_status")
    private Map<String, Boolean> mutedStatus;

    @Column(name = "notification_settings")
    private Map<String, Boolean> notificationSettings;

    @Column(name = "read_by")
    private Map<Long, String> readBy = new HashMap<>();
}
