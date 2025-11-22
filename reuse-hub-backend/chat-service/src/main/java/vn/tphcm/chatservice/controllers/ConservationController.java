/*
 * @ (#) ConservationController.java       1.0     11/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/13/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.services.ConversationService;
import vn.tphcm.chatservice.services.MessageService;

@RestController
@RequestMapping("/chats/conservations")
@RequiredArgsConstructor
@Slf4j(topic = "CONSERVATION-CONTROLLER")
public class ConservationController {
    private final ConversationService conversationService;
    private final MessageService messageService;

    private String getUserIdFromHeader(@RequestHeader("X-User-Id") String userId) {
        if (userId == null || userId.isBlank()) {
            log.error("Missing X-User-Id header in chat request");
            throw new SecurityException("User ID not found in request header. Is API Gateway configured?");
        }
        return userId;
    }

    @PostMapping("/create/{otherUserId}")
    public ApiResponse<ConversationResponse> createConversation(@RequestHeader("X-User-Id") String userId, @PathVariable String otherUserId, @RequestParam(required = false) String itemId) {
        log.info("Create conversation request from userId: {} with otherUserId: {}", userId, otherUserId);

        String requesterId = getUserIdFromHeader(userId);

        return conversationService.createConversation(requesterId, otherUserId, itemId);
    }

    @GetMapping("/with/{otherUserId}")
    public ApiResponse<ConversationResponse> getConversation(@RequestHeader("X-User-Id") String userId, @PathVariable String otherUserId, @RequestParam(required = false) String itemId) {
        log.info("Get conversation request from userId: {} with otherUserId: {}", userId, otherUserId);

        String requesterId = getUserIdFromHeader(userId);

        return conversationService.getConversations(requesterId, otherUserId, itemId);
    }

    @GetMapping
    public ApiResponse<PageResponse<ConversationResponse>> getMyConversations(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Get my conversations request from userId: {}, page: {}, size: {}", userId, page, size);

        String requesterId = getUserIdFromHeader(userId);

        return conversationService.getMyConversations(requesterId, page, size);
    }

    @GetMapping("/{conversationId}/messages")
    public ApiResponse<PageResponse<MessageResponse>> getMessages(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("Get messages request from userId: {} for conversation: {}, page: {}, size: {}", userId, conversationId, page, size);

        String requesterId = getUserIdFromHeader(userId);

        return messageService.getMessages(conversationId, requesterId, page, size);
    }
}
