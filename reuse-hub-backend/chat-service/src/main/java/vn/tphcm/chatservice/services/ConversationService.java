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

import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;

@Service
public interface ConversationService {
    ApiResponse<ConversationResponse> createConversation(String userFirstId, String userSecondId, String itemId);

    ApiResponse<ConversationResponse> getConversations(String userFirstId, String userSecondId, String itemId);

    ApiResponse<PageResponse<ConversationResponse>> getMyConversations(String userId, int page, int size);
}
