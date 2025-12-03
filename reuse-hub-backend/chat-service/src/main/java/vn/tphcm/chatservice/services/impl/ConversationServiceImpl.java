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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.client.ItemServiceClient;
import vn.tphcm.chatservice.client.ProfileServiceClient;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;
import vn.tphcm.chatservice.dtos.response.ItemResponse;
import vn.tphcm.chatservice.dtos.response.ProfileResponse;
import vn.tphcm.chatservice.exceptions.InvalidDataException;
import vn.tphcm.chatservice.mapper.ConversationMapper;
import vn.tphcm.chatservice.models.Conversation;
import vn.tphcm.chatservice.repositories.ConversationRepository;
import vn.tphcm.chatservice.services.ConversationService;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CONVERSATION-SERVICE")
public class ConversationServiceImpl implements ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final ProfileServiceClient profileClient;
    private final ItemServiceClient itemServiceClient;

    @Override
    public ApiResponse<ConversationResponse> createConversation(String userFirstId, String userSecondId, String itemId) {
        log.info("Creating conversation between {} and {}", userFirstId, userSecondId);

        List<Conversation> conversations = conversationRepository.findByParticipantIds(userFirstId, userSecondId);

        if (!conversations.isEmpty()) {
            Conversation existing = conversations.get(0);
            log.info("Found existing conversation: {}", existing.getId());
            return ApiResponse.<ConversationResponse>builder()
                    .status(OK.value())
                    .data(conversationMapper.toResponse(existing))
                    .message("Conversation already exists.")
                    .build();
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .participantIds(List.of(userFirstId, userSecondId))
                .build();

        conversation = conversationRepository.save(conversation);

        ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userSecondId);

        ConversationResponse response = conversationMapper.toResponse(conversation);

        response.setOtherParticipantAvatar(profileResponse.getData().getAvatarUrl());
        response.setOtherParticipantName(profileResponse.getData().getFirstName() + " " + profileResponse.getData().getLastName());
        response.setOtherParticipantId(profileResponse.getData().getUserId());

        ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);

        response.setItemId(itemResponse.getData().getId());
        response.setItemTitle(itemResponse.getData().getTitle());
        response.setItemThumbnail(itemResponse.getData().getImages().get(0));

        return ApiResponse.<ConversationResponse>builder()
                .status(CREATED.value())
                .data(response)
                .message("Conversation created successfully.")
                .build();
    }

    @Override
    public ApiResponse<ConversationResponse> getConversations(String userFirstId, String userSecondId, String itemId) {
        log.info("Fetching conversations between {} and {}", userFirstId, userSecondId);

        List<Conversation> conversations = conversationRepository.findByParticipantIds(userFirstId, userSecondId);

        if (conversations.isEmpty()) {
            throw new InvalidDataException("No conversation found between the users.");
        }

        Conversation conversation = conversations.get(0);

        conversation = conversationRepository.save(conversation);

        ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userSecondId);

        ConversationResponse response = conversationMapper.toResponse(conversation);

        response.setOtherParticipantAvatar(profileResponse.getData().getAvatarUrl());
        response.setOtherParticipantName(profileResponse.getData().getFirstName() + " " + profileResponse.getData().getLastName());
        response.setOtherParticipantId(profileResponse.getData().getUserId());

        ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);

        response.setItemId(itemResponse.getData().getId());
        response.setItemTitle(itemResponse.getData().getTitle());
        response.setItemThumbnail(itemResponse.getData().getImages().get(0));

        return ApiResponse.<ConversationResponse>builder()
                .status(OK.value())
                .data(response)
                .message("Conversation fetched successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ConversationResponse>> getMyConversations(String userId, int page, int size) {
        log.info("Fetching conversations for user {}", userId);

        Pageable pageable = createPageable(page, size);

        Page<Conversation> conversationPage = conversationRepository.findByParticipantIdsContains(userId, pageable);

        Page<ConversationResponse> conversationResponsePage = conversationPage.map(conversation -> {
            ConversationResponse response = conversationMapper.toResponse(conversation);

            String otherUserId = response.getParticipantIds().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);

            response.setOtherParticipantId(otherUserId);

            if (otherUserId != null) {
                try {
                    ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(otherUserId);

                    if (profileResponse.getStatus() == OK.value() && profileResponse.getData() != null) {
                        response.setOtherParticipantName(profileResponse.getData().getFirstName() + " " + profileResponse.getData().getLastName());
                        response.setOtherParticipantAvatar(profileResponse.getData().getAvatarUrl());
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch profile for user {}: {}", otherUserId, e.getMessage());
                }
            }
            return response;
        });

        return ApiResponse.<PageResponse<ConversationResponse>>builder()
                .status(OK.value())
                .data(createPageResponse(conversationResponsePage))
                .message("Conversations fetched successfully.")
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

