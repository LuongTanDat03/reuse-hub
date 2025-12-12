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
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SendMessageRequest {
    private String senderId;

    private String recipientId;

    private String content;

    // Conversation ID (optional - if provided, use this instead of looking up by participants)
    private String conversationId;

    // Message type (TEXT, PRICE_OFFER, OFFER_ACCEPTED, etc.)
    private String messageType;

    // Price offer fields
    private Double offerPrice;
    private String relatedOfferId;  // For accept/reject/counter - reference to original offer
    private String itemId;
    private String itemTitle;
    private String itemThumbnail;
    private Double originalPrice;
}
