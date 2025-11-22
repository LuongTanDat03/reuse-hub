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


import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;

public interface MessageService {
    ApiResponse<MessageResponse> sendMessage(SendMessageRequest request);

    ApiResponse<PageResponse<MessageResponse>> getMessages(String conversationId, String userId, int page, int size);
}
