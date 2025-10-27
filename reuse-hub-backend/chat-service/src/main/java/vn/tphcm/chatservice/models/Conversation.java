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

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import org.bson.types.ObjectId;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.tphcm.chatservice.commons.ConversationStatus;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@Builder
@CompoundIndex(name = "uniq_participants_idx", def = "{'participants': 1}", unique = true, sparse = true)
public class Conversation extends AbstractEntity<ObjectId> implements Serializable {

    @Indexed(unique = true)
    private List<String> participants;

    @Indexed(unique = true)
    @Column(name = "participants_key", unique = true)
    private String participantsKey;

    @Column(name = "last_message_id")
    private String lastMessageId;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ConversationStatus status;

    @Column(name = "pinned_messages")
    private List<String> pinnedMessages;

    @Column(name = "muted_status")
    private Map<String, Boolean> mutedStatus;

    @Column(name = "notification_settings")
    private Map<String, Boolean> notificationSettings;
}
