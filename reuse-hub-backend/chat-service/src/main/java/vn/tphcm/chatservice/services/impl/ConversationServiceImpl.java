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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.client.ItemServiceClient;
import vn.tphcm.chatservice.client.ProfileServiceClient;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.PageResponse;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;
import vn.tphcm.chatservice.dtos.response.ItemResponse;
import vn.tphcm.chatservice.dtos.response.ProfileResponse;
import vn.tphcm.chatservice.exceptions.InvalidDataException;
import vn.tphcm.chatservice.exceptions.ResourceNotFoundException;
import vn.tphcm.chatservice.mapper.ConversationMapper;
import vn.tphcm.chatservice.models.Conversation;
import vn.tphcm.chatservice.repositories.ConversationRepository;
import vn.tphcm.chatservice.services.ConversationService;

import java.util.List;
import java.util.Optional;

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
        log.info("Creating conversation between {} and {} for item {}", userFirstId, userSecondId, itemId);

        // Find existing conversation based on participants AND itemId
        Optional<Conversation> existingConversation = findExistingConversation(userFirstId, userSecondId, itemId);

        if (existingConversation.isPresent()) {
            Conversation existing = existingConversation.get();
            log.info("Found existing conversation: {} for item: {}", existing.getId(), existing.getItemId());
            
            ConversationResponse response = buildConversationResponse(existing, userSecondId, itemId);
            
            return ApiResponse.<ConversationResponse>builder()
                    .status(OK.value())
                    .data(response)
                    .message("Conversation already exists.")
                    .build();
        }

        // Create new conversation with item info
        Conversation conversation = createNewConversation(userFirstId, userSecondId, itemId);
        conversation = conversationRepository.save(conversation);
        log.info("Created new conversation: {} for item: {}", conversation.getId(), conversation.getItemId());

        ConversationResponse response = buildConversationResponse(conversation, userSecondId, itemId);

        return ApiResponse.<ConversationResponse>builder()
                .status(CREATED.value())
                .data(response)
                .message("Conversation created successfully.")
                .build();
    }

    /**
     * Find existing conversation by participants and itemId
     * - If itemId is provided: find conversation with that specific item
     * - If itemId is null/blank: find conversation without item (general chat)
     */
    private Optional<Conversation> findExistingConversation(String userFirstId, String userSecondId, String itemId) {
        if (itemId != null && !itemId.isBlank()) {
            // Find conversation for specific item
            return conversationRepository.findByParticipantIdsAndItemId(userFirstId, userSecondId, itemId);
        } else {
            // Find general conversation (without item)
            Optional<Conversation> withoutItem = conversationRepository.findByParticipantIdsWithoutItem(userFirstId, userSecondId);
            if (withoutItem.isPresent()) {
                return withoutItem;
            }
            // Also check for null itemId
            return conversationRepository.findByParticipantIdsWithNullItem(userFirstId, userSecondId);
        }
    }

    /**
     * Create new conversation with item info if provided
     */
    private Conversation createNewConversation(String userFirstId, String userSecondId, String itemId) {
        Conversation.ConversationBuilder builder = Conversation.builder()
                .participantIds(List.of(userFirstId, userSecondId));
        
        if (itemId != null && !itemId.isBlank()) {
            try {
                ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
                if (itemResponse != null && itemResponse.getData() != null) {
                    ItemResponse item = itemResponse.getData();
                    builder.itemId(item.getId())
                           .itemTitle(item.getTitle())
                           .itemPrice(item.getPrice() != null ? item.getPrice().doubleValue() : null)
                           .itemOwnerId(item.getUserId()); // Save item owner (seller)
                    if (item.getImages() != null && !item.getImages().isEmpty()) {
                        builder.itemThumbnail(item.getImages().get(0));
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching item {} during conversation creation: {}", itemId, e.getMessage());
                // Still set itemId even if we can't fetch details
                builder.itemId(itemId);
            }
        }
        
        return builder.build();
    }

    /**
     * Build ConversationResponse with profile and item info
     */
    private ConversationResponse buildConversationResponse(Conversation conversation, String otherUserId, String itemId) {
        ConversationResponse response = conversationMapper.toResponse(conversation);
        
        // Fetch other participant profile
        enrichWithProfileInfo(response, otherUserId);
        
        // Use item info from conversation if available, otherwise fetch
        if (conversation.getItemId() != null) {
            response.setItemId(conversation.getItemId());
            response.setItemTitle(conversation.getItemTitle());
            response.setItemThumbnail(conversation.getItemThumbnail());
            response.setItemPrice(conversation.getItemPrice());
            response.setItemOwnerId(conversation.getItemOwnerId());
        } else if (itemId != null && !itemId.isBlank()) {
            enrichWithItemInfo(response, itemId);
        }
        
        return response;
    }

    /**
     * Enrich response with profile info
     */
    private void enrichWithProfileInfo(ConversationResponse response, String userId) {
        try {
            ApiResponse<ProfileResponse> profileResponse = profileClient.getProfile(userId);
            if (profileResponse != null && profileResponse.getData() != null) {
                ProfileResponse profile = profileResponse.getData();
                response.setOtherParticipantAvatar(profile.getAvatarUrl());
                response.setOtherParticipantName(
                    ((profile.getFirstName() != null ? profile.getFirstName() : "") + " " + 
                    (profile.getLastName() != null ? profile.getLastName() : "")).trim()
                );
                response.setOtherParticipantId(profile.getUserId());
            } else {
                response.setOtherParticipantId(userId);
            }
        } catch (Exception e) {
            log.error("Error fetching profile for user {}: {}", userId, e.getMessage());
            response.setOtherParticipantId(userId);
        }
    }

    /**
     * Enrich response with item info
     */
    private void enrichWithItemInfo(ConversationResponse response, String itemId) {
        try {
            ApiResponse<ItemResponse> itemResponse = itemServiceClient.getItemById(itemId);
            if (itemResponse != null && itemResponse.getData() != null) {
                ItemResponse item = itemResponse.getData();
                response.setItemId(item.getId());
                response.setItemTitle(item.getTitle());
                response.setItemPrice(item.getPrice() != null ? item.getPrice().doubleValue() : null);
                response.setItemOwnerId(item.getUserId());
                if (item.getImages() != null && !item.getImages().isEmpty()) {
                    response.setItemThumbnail(item.getImages().get(0));
                }
            }
        } catch (Exception e) {
            log.error("Error fetching item {}: {}", itemId, e.getMessage());
        }
    }

    @Override
    public ApiResponse<ConversationResponse> getConversations(String userFirstId, String userSecondId, String itemId) {
        log.info("Fetching conversation between {} and {} for item {}", userFirstId, userSecondId, itemId);

        Optional<Conversation> conversationOpt = findExistingConversation(userFirstId, userSecondId, itemId);

        if (conversationOpt.isEmpty()) {
            throw new ResourceNotFoundException("No conversation found between the users" + 
                (itemId != null ? " for this item." : "."));
        }

        Conversation conversation = conversationOpt.get();
        ConversationResponse response = buildConversationResponse(conversation, userSecondId, itemId);

        return ApiResponse.<ConversationResponse>builder()
                .status(OK.value())
                .data(response)
                .message("Conversation fetched successfully.")
                .build();
    }

    @Override
    public ApiResponse<PageResponse<ConversationResponse>> getMyConversations(String userId, int page, int size) {
        log.info("Fetching conversations for user {}", userId);

        // Sort by lastMessageTimestamp descending (most recent first)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageTimestamp"));

        Page<Conversation> conversationPage = conversationRepository.findByParticipantIdsContains(userId, pageable);

        Page<ConversationResponse> conversationResponsePage = conversationPage.map(conversation -> {
            ConversationResponse response = conversationMapper.toResponse(conversation);

            log.debug("Processing conversation: id={}, itemId={}, participantIds={}", 
                conversation.getId(), conversation.getItemId(), conversation.getParticipantIds());
            
            String otherUserId = conversation.getParticipantIds().stream()
                    .filter(id -> !id.equals(userId))
                    .findFirst()
                    .orElse(null);

            response.setOtherParticipantId(otherUserId);

            // Enrich with profile info
            if (otherUserId != null) {
                enrichWithProfileInfo(response, otherUserId);
            }

            // Item info is already in conversation, just map it
            response.setItemId(conversation.getItemId());
            response.setItemTitle(conversation.getItemTitle());
            response.setItemThumbnail(conversation.getItemThumbnail());
            response.setItemPrice(conversation.getItemPrice());
            response.setItemOwnerId(conversation.getItemOwnerId());

            return response;
        });

        return ApiResponse.<PageResponse<ConversationResponse>>builder()
                .status(OK.value())
                .data(createPageResponse(conversationResponsePage))
                .message("Conversations fetched successfully.")
                .build();
    }

    @Override
    public ApiResponse<ConversationResponse> getConversationById(String conversationId, String userId) {
        log.info("Fetching conversation {} for user {}", conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        // Verify user is participant
        if (!conversation.getParticipantIds().contains(userId)) {
            throw new InvalidDataException("User is not a participant of this conversation");
        }

        String otherUserId = conversation.getParticipantIds().stream()
                .filter(id -> !id.equals(userId))
                .findFirst()
                .orElse(null);

        ConversationResponse response = buildConversationResponse(conversation, otherUserId, conversation.getItemId());

        return ApiResponse.<ConversationResponse>builder()
                .status(OK.value())
                .data(response)
                .message("Conversation fetched successfully.")
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

