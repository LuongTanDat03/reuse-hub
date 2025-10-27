/*
 * @ (#) CreateConversationRequest.java       1.0     10/11/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 10/11/2025
 */

import lombok.Getter;

@Getter
public class CreateConversationRequest {
    private String recipientUserId;
}
