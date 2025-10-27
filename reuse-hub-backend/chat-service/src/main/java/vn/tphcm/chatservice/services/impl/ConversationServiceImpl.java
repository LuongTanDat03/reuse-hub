/*
 * @ (#) MessageServiceImpl.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.commons.ConversationStatus;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.request.CreateConversationRequest;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;
import vn.tphcm.chatservice.exceptions.ResourceNotFoundException;
import vn.tphcm.chatservice.mapper.ConversationMapper;
import vn.tphcm.chatservice.models.Conversation;
import vn.tphcm.chatservice.repositories.ConversationRepository;
import vn.tphcm.chatservice.services.CacheService;
import vn.tphcm.chatservice.services.ConversationService;

import java.util.*;

import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CONVERSATION-SERVICE")
public class ConversationServiceImpl implements ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final CacheService cacheService;

    @Override
    public ApiResponse<ConversationResponse> createConversation(String userId, CreateConversationRequest request) {
        String participantsKey = generateParticipantsKey(userId, request.getRecipientUserId());

        Optional<Conversation> existingConversation = conversationRepository.findByParticipantsKey(participantsKey);
        if (existingConversation.isEmpty()) {
            List<String> participants = Arrays.asList(userId, request.getRecipientUserId());

            Conversation conversation = Conversation.builder()
                    .participants(participants)
                    .participantsKey(participantsKey)
                    .status(ConversationStatus.ACTIVE)
                    .mutedStatus(new HashMap<>())
                    .notificationSettings(new HashMap<>())
                    .pinnedMessages(new ArrayList<>())
                    .build();

            conversation = conversationRepository.save(conversation);

            return ApiResponse.<ConversationResponse>builder()
                    .status(OK.value())
                    .message("Conversation created successfully")
                    .data(conversationMapper.toResponse(conversation))
                    .build();
        }
        return ApiResponse.<ConversationResponse>builder()
                .status(OK.value())
                .message("Conversation already exists")
                .data(conversationMapper.toResponse(existingConversation.get()))
                .build();

    }

    @Override
    public ApiResponse<Page<ConversationResponse>> getUserConversations(String userId, int page, int size) {
        Pageable pageable = createPageable(page, size);

        Page<Conversation> conversations = conversationRepository.findConversationsOfUser(userId, pageable);

        List<ConversationResponse> conversationResponses = conversations.getContent()
                .stream()
                .map(conversationMapper::toResponse)
                .toList();

        return ApiResponse.<Page<ConversationResponse>>builder()
                .status(OK.value())
                .message("User conversations retrieved successfully")
                .data(new PageImpl<>(conversationResponses, pageable, conversations.getTotalElements()))
                .build();
    }

    @Override
    public ApiResponse<ConversationResponse> getConversationById(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        return ApiResponse.<ConversationResponse>builder()
                .status(OK.value())
                .message("Conversation retrieved successfully")
                .data(conversationMapper.toResponse(conversation))
                .build();
    }

    @Override
    public ApiResponse<Void> muteConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        conversation.getMutedStatus().put(conversationId, true);

        conversationRepository.save(conversation);

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("Conversation muted successfully")
                .build();
    }

    @Override
    public ApiResponse<Void> blockUser(String userId, String blockedUserId,boolean isBlock) {
        Conversation conversation = conversationRepository.findByTwoUsers(userId, blockedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (isBlock) {
            conversation.setStatus(ConversationStatus.HIDE);
        } else {
            conversation.setStatus(ConversationStatus.ACTIVE);
        }

        return ApiResponse.<Void>builder()
                .status(OK.value())
                .message("User " + (isBlock ? "blocked" : "unblocked") + " successfully")
                .build();
    }

    @Override
    public ApiResponse<Void> deleteConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        conversation.setStatus(ConversationStatus.HIDE);
        conversationRepository.save(conversation);

        cacheService.removeUserFromConversation(conversationId, userId);
        cacheService.evictMessage(conversationId);
        return null;
    }

    private String generateParticipantsKey(String userId1, String userId2) {
        List<String> sorted = Arrays.asList(userId1, userId2);
        Collections.sort(sorted);
        return String.join("_", sorted);
    }

    private Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size);
    }
}

