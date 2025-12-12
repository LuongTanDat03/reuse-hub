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

import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import vn.tphcm.chatservice.commons.ConversationStatus;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@Builder
public class Conversation extends AbstractEntity<String> implements Serializable {
    @Indexed
    private List<String> participantIds;

    private String lastMessageId;

    @Indexed
    private Instant lastMessageTimestamp;

    private ConversationStatus status;

    private List<String> pinnedMessages;

    private Map<String, Boolean> mutedStatus;

    private Map<String, Boolean> notificationSettings;

    // Item information (for product-related conversations)
    @Indexed
    private String itemId;
    
    private String itemTitle;
    
    private String itemThumbnail;
    
    private Double itemPrice;
    
    // Owner of the item (seller)
    private String itemOwnerId;
}
