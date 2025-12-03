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
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.exceptions.InvalidDataException;
import vn.tphcm.chatservice.exceptions.ResourceNotFoundException;
import vn.tphcm.chatservice.mapper.MessageMapper;
import vn.tphcm.chatservice.models.Conversation;
import vn.tphcm.chatservice.models.Message;
import vn.tphcm.chatservice.repositories.ConversationRepository;
import vn.tphcm.chatservice.repositories.MessageRepository;
import vn.tphcm.chatservice.services.MessagePublisher;
import vn.tphcm.chatservice.services.MessageService;
import vn.tphcm.event.commons.EventType;
import vn.tphcm.event.dto.NotificationMessage;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-SERVICE")
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final MessageMapper messageMapper;
    private final MessagePublisher messagePublisher;

    @Override
    public ApiResponse<MessageResponse> sendMessage(SendMessageRequest request) {
        log.info("Sending message from {} to conversation {}", request.getSenderId(), request.getRecipientId());

        List<Conversation> conversations = conversationRepository
                .findByParticipantIds(request.getSenderId(), request.getRecipientId());
        
        if (conversations.isEmpty()) {
            throw new ResourceNotFoundException("Conversation not found or access denied");
        }
        
        Conversation conversation = conversations.get(0);

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(request.getSenderId())
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .build();

        messageRepository.save(message);
        log.info("Message saved with ID: {}", message.getId());

        conversation.setLastMessageId(String.valueOf(message.getId()));
        conversation.setLastMessageTimestamp(Instant.now());
        conversationRepository.save(conversation);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientId(request.getRecipientId())
                .title("New Message")
                .content(request.getContent())
                .type(EventType.NEW_MESSAGE)
                .actorUserId(request.getSenderId())
                .data(Map.of("conversationId", conversation.getId(),
                        "senderId", request.getSenderId()))
                .build();

        messagePublisher.publishNotificationMessage(notification);

        log.info("Notification published for message ID: {}", message.getId());

        return ApiResponse.<MessageResponse>builder()
                .message("Send message successfully")
                .data(messageMapper.toResponse(message))
                .status(OK.value())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<MessageResponse>> getMessages(String conversationId, String userId, int page, int size) {
        log.info("Fetching messages for conversation {} by user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)){
            log.warn("Access denied for user {} to conversation {}", userId, conversationId);
            throw new InvalidDataException("Access denied to this conversation");
        }

        Pageable pageable = createPageable(page, size);

        Page<Message> messagePage = messageRepository.findByConversationId(conversation.getId(), pageable);

        Page<MessageResponse> messageResponsePage = messagePage.map(messageMapper::toResponse);

        PageResponse<MessageResponse> pageResponse = createPageResponse(messageResponsePage);

        return ApiResponse.<PageResponse<MessageResponse>>builder()
                .status(OK.value())
                .data(pageResponse)
                .message("Messages fetched successfully.")
                .build();
    }

    private Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size);
    }

    private <T> PageResponse<T> createPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }
}
