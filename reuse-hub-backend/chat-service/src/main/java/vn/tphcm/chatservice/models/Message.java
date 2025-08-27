/*
 * @ (#) Message.java       1.0     8/25/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/25/2025
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.tphcm.chatservice.commons.MessageStatus;
import vn.tphcm.chatservice.commons.MessageType;
import vn.tphcm.chatservice.commons.ReactionType;

import java.io.Serializable;
import java.util.EnumMap;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message extends AbstractEntity<ObjectId> implements Serializable {

    @Column(name = "conversation_id")
    private String conversationId;

    @Column(name = "sender_id")
    private Long senderId;

    private String content;

    @Column(name = "reply_to_message_id")
    private String replyToMessageId;

    @Column(name = "target_user_ids")
    private List<String> targetUserIds;

    private List<String> media;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private MessageStatus status;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private MessageType type;

    private EnumMap<ReactionType, List<Long>> reactions;

    @Column(name = "deleted_by")
    private List<String> deletedBy;
}
