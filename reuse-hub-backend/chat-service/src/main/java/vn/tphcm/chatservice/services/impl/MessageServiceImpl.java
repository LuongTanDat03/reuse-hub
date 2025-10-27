/*
 * @ (#) MessageServiceImpl.java       1.0     10/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/6/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.commons.MessageStatus;
import vn.tphcm.chatservice.commons.MessageType;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.exceptions.ResourceNotFoundException;
import vn.tphcm.chatservice.mapper.MessageMapper;
import vn.tphcm.chatservice.models.Conversation;
import vn.tphcm.chatservice.models.Message;
import vn.tphcm.chatservice.repositories.ConversationRepository;
import vn.tphcm.chatservice.repositories.MessageRepository;
import vn.tphcm.chatservice.services.CacheService;
import vn.tphcm.chatservice.services.MessagePublisher;
import vn.tphcm.chatservice.services.MessageService;
import vn.tphcm.event.dto.MessageEvent;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-SERVICE")
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final CacheService cacheService;
    private final MessageMapper messageMapper;
    private final MessagePublisher messagePublisher;

    @Override
    public ApiResponse<MessageResponse> sendMessage(SendMessageRequest request, String senderId) {
        Conversation conversation = conversationRepository
                .findByIdAndUserId(request.getConversationId(), senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or access denied"));

        Message message = messageMapper.toMessage(request);

        message.setConversationId(request.getConversationId());
        message.setSenderId(senderId);
        message.setContent(request.getContent());
        message.setReplyToMessageId(request.getReplyToMessageId());
        message.setStatus(MessageStatus.SENT);
        message.setType(MessageType.TEXT);

        messageRepository.save(message);

        conversation.setLastMessageId(String.valueOf(message.getId()));
        conversation.setLastActivity(LocalDateTime.now());
        conversationRepository.save(conversation);

        String receiverId = conversation.getParticipants().stream()
                .filter(p -> !p.equals(senderId))
                .findFirst()
                .orElse(null);

        MessageResponse response = messageMapper.toResponse(message);
        cacheService.cacheMessage(request.getConversationId(), response);

        cacheService.setUserStoppedTyping(String.valueOf(conversation.getId()), senderId);

        MessageEvent event = MessageEvent.builder()
                .eventType("MESSAGE_SENT")
                .messageId(String.valueOf(message.getId()))
                .conversationId(String.valueOf(conversation.getId()))
                .senderId(senderId)
                .content(message.getContent())
                .replyToMessageId(message.getReplyToMessageId())
                .build();

        messagePublisher.publishMessage(event);

        log.info("Message sent: {} from {} to {}", message.getId(), senderId, receiverId);

        return ApiResponse.<MessageResponse>builder()
                .message("Send message successfully")
                .data(response)
                .status(OK.value())
                .build();
    }

    @Override
    public ApiResponse<Page<MessageResponse>> getMessages(String conversationId, String userId, int page, int size) {
        Conversation conversation = conversationRepository
                .findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found or access denied"));

        Pageable pageable = createPageable(page, size);

        if (cacheService.getMessage(conversationId)){

        }

        return null;
    }

    @Override
    public ApiResponse<MessageResponse> editMessage(String messageId, String newContent, String userId) {
        return null;
    }

    @Override
    public ApiResponse<MessageResponse> deleteMessage(String messageId, String userId) {
        return null;
    }

    @Override
    public ApiResponse<Void> markMessageAsRead(String conversationId, String userId) {
        return null;
    }

    @Override
    public ApiResponse<List<MessageResponse>> searchMessages(String conversationId, String userId, String keyword) {
        return null;
    }

    private Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size);
    }
}
