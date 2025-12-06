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
            
            ConversationResponse response = conversationMapper.toResponse(existing);
            
            // Fetch other participant profile
            try {
                ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userSecondId);
                if (profileResponse != null && profileResponse.getData() != null) {
                    ProfileResponse profile = profileResponse.getData();
                    response.setOtherParticipantAvatar(profile.getAvatarUrl());
                    response.setOtherParticipantName(
                        (profile.getFirstName() != null ? profile.getFirstName() : "") + " " + 
                        (profile.getLastName() != null ? profile.getLastName() : "")
                    );
                    response.setOtherParticipantId(profile.getUserId());
                } else {
                    response.setOtherParticipantId(userSecondId);
                }
            } catch (Exception e) {
                log.error("Error fetching profile for user {}: {}", userSecondId, e.getMessage());
                response.setOtherParticipantId(userSecondId);
            }
            
            // Fetch item details if itemId is provided
            if (itemId != null && !itemId.isBlank()) {
                try {
                    ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
                    if (itemResponse != null && itemResponse.getData() != null) {
                        ItemResponse item = itemResponse.getData();
                        response.setItemId(item.getId());
                        response.setItemTitle(item.getTitle());
                        if (item.getImages() != null && !item.getImages().isEmpty()) {
                            response.setItemThumbnail(item.getImages().get(0));
                        }
                    }
                } catch (Exception e) {
                    log.error("Error fetching item {}: {}", itemId, e.getMessage());
                }
            }
            
            return ApiResponse.<ConversationResponse>builder()
                    .status(OK.value())
                    .data(response)
                    .message("Conversation already exists.")
                    .build();
        }

        // Create new conversation
        Conversation.ConversationBuilder conversationBuilder = Conversation.builder()
                .participantIds(List.of(userFirstId, userSecondId));
        
        // Fetch and save item info if itemId is provided
        if (itemId != null && !itemId.isBlank()) {
            try {
                ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
                if (itemResponse != null && itemResponse.getData() != null) {
                    ItemResponse item = itemResponse.getData();
                    conversationBuilder
                        .itemId(item.getId())
                        .itemTitle(item.getTitle());
                    if (item.getImages() != null && !item.getImages().isEmpty()) {
                        conversationBuilder.itemThumbnail(item.getImages().get(0));
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching item {} during conversation creation: {}", itemId, e.getMessage());
            }
        }
        
        Conversation conversation = conversationBuilder.build();
        conversation = conversationRepository.save(conversation);

        ConversationResponse response = conversationMapper.toResponse(conversation);

        // Fetch other participant profile
        try {
            ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userSecondId);
            if (profileResponse != null && profileResponse.getData() != null) {
                ProfileResponse profile = profileResponse.getData();
                response.setOtherParticipantAvatar(profile.getAvatarUrl());
                response.setOtherParticipantName(
                    (profile.getFirstName() != null ? profile.getFirstName() : "") + " " + 
                    (profile.getLastName() != null ? profile.getLastName() : "")
                );
                response.setOtherParticipantId(profile.getUserId());
            } else {
                log.warn("Profile not found for user: {}", userSecondId);
                response.setOtherParticipantId(userSecondId);
            }
        } catch (Exception e) {
            log.error("Error fetching profile for user {}: {}", userSecondId, e.getMessage());
            response.setOtherParticipantId(userSecondId);
        }

        // Fetch item details if itemId is provided
        if (itemId != null && !itemId.isBlank()) {
            try {
                ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
                if (itemResponse != null && itemResponse.getData() != null) {
                    ItemResponse item = itemResponse.getData();
                    response.setItemId(item.getId());
                    response.setItemTitle(item.getTitle());
                    if (item.getImages() != null && !item.getImages().isEmpty()) {
                        response.setItemThumbnail(item.getImages().get(0));
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching item {}: {}", itemId, e.getMessage());
            }
        }

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

        ConversationResponse response = conversationMapper.toResponse(conversation);

        // Fetch other participant profile
        try {
            ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userSecondId);
            if (profileResponse != null && profileResponse.getData() != null) {
                ProfileResponse profile = profileResponse.getData();
                response.setOtherParticipantAvatar(profile.getAvatarUrl());
                response.setOtherParticipantName(
                    (profile.getFirstName() != null ? profile.getFirstName() : "") + " " + 
                    (profile.getLastName() != null ? profile.getLastName() : "")
                );
                response.setOtherParticipantId(profile.getUserId());
            } else {
                log.warn("Profile not found for user: {}", userSecondId);
                response.setOtherParticipantId(userSecondId);
            }
        } catch (Exception e) {
            log.error("Error fetching profile for user {}: {}", userSecondId, e.getMessage());
            response.setOtherParticipantId(userSecondId);
        }

        // Fetch item details if itemId is provided
        if (itemId != null && !itemId.isBlank()) {
            try {
                ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
                if (itemResponse != null && itemResponse.getData() != null) {
                    ItemResponse item = itemResponse.getData();
                    response.setItemId(item.getId());
                    response.setItemTitle(item.getTitle());
                    if (item.getImages() != null && !item.getImages().isEmpty()) {
                        response.setItemThumbnail(item.getImages().get(0));
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching item {}: {}", itemId, e.getMessage());
            }
        }

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

            log.info("Processing conversation: id={}, participantIds={}", conversation.getId(), conversation.getParticipantIds());
            
            String otherUserId = response.getParticipantIds().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);

            log.info("Determined otherUserId: {} for currentUserId: {}", otherUserId, userId);
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

