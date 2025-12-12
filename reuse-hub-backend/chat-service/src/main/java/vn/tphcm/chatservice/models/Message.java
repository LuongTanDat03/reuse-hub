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

import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
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
@Builder
public class Message extends AbstractEntity<String> implements Serializable {
    @Indexed
    private String conversationId;

    @Indexed
    private String senderId;

    private String recipientId;

    private String content;

    private List<String> media;

    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    private MessageType type;

    private EnumMap<ReactionType, List<String>> reactions;

    // Price offer fields
    private Double offerPrice;           // The offered price
    private String offerStatus;          // PENDING, ACCEPTED, REJECTED, COUNTERED
    private String relatedOfferId;       // Reference to original offer message (for accept/reject/counter)
    private String itemId;               // Item being negotiated
    private String itemTitle;            // Item title for display
    private String itemThumbnail;        // Item thumbnail for display
    private Double originalPrice;        // Original item price for reference
}
