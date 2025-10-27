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
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;

import java.util.List;

public interface MessageService {
    ApiResponse<MessageResponse> sendMessage(SendMessageRequest request, String senderId);

    ApiResponse<Page<MessageResponse>> getMessages(String conversationId, String userId, int page, int size);

    ApiResponse<MessageResponse> editMessage(String messageId, String newContent, String userId);

    ApiResponse<MessageResponse> deleteMessage(String messageId, String userId);

    ApiResponse<Void> markMessageAsRead(String conversationId, String userId);

    ApiResponse<List<MessageResponse>> searchMessages(String conversationId, String userId, String keyword);
}
