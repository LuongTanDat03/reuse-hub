/*
 * @ (#) MessageService.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.request.CreateConversationRequest;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;

@Service
public interface ConversationService {
    ApiResponse<ConversationResponse> createConversation(String userId, CreateConversationRequest request);

    ApiResponse<Page<ConversationResponse>> getUserConversations(String userId, int page, int size);

    ApiResponse<ConversationResponse> getConversationById(String conversationId, String userId);

    ApiResponse<Void> muteConversation(String conversationId, String userId);

    ApiResponse<Void> blockUser(String userId, String blockedUserId, boolean isBlock);

    ApiResponse<Void> deleteConversation(String conversationId, String userId);
}
