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
        log.info("Sending message from {} to {}, conversationId: {}", 
            request.getSenderId(), request.getRecipientId(), request.getConversationId());

        Conversation conversation;
        
        // If conversationId is provided, use it directly
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + request.getConversationId()));
            
            // Verify sender is a participant
            if (!conversation.getParticipantIds().contains(request.getSenderId())) {
                throw new InvalidDataException("User is not a participant of this conversation");
            }
        } else {
            // Fallback to finding by participants
            List<Conversation> conversations = conversationRepository
                    .findByParticipantIds(request.getSenderId(), request.getRecipientId());
            
            if (conversations.isEmpty()) {
                throw new ResourceNotFoundException("Conversation not found or access denied");
            }
            
            conversation = conversations.get(0);
        }

        // Determine message type
        MessageType messageType = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                messageType = MessageType.valueOf(request.getMessageType());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid message type: {}, defaulting to TEXT", request.getMessageType());
            }
        }

        // Build message with offer fields if applicable
        Message.MessageBuilder messageBuilder = Message.builder()
                .conversationId(conversation.getId())
                .senderId(request.getSenderId())
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .type(messageType)
                .status(MessageStatus.SENT);

        // Handle price offer messages
        if (isPriceOfferType(messageType)) {
            log.info("Price offer message - offerPrice: {}, itemId: {}, originalPrice: {}", 
                request.getOfferPrice(), request.getItemId(), request.getOriginalPrice());
            messageBuilder
                .offerPrice(request.getOfferPrice())
                .itemId(request.getItemId())
                .itemTitle(request.getItemTitle())
                .itemThumbnail(request.getItemThumbnail())
                .originalPrice(request.getOriginalPrice())
                .relatedOfferId(request.getRelatedOfferId());

            // Set offer status based on message type
            if (messageType == MessageType.PRICE_OFFER || messageType == MessageType.OFFER_COUNTERED) {
                messageBuilder.offerStatus("PENDING");
            } else if (messageType == MessageType.OFFER_ACCEPTED) {
                messageBuilder.offerStatus("ACCEPTED");
                // Update original offer status if relatedOfferId is provided
                updateOriginalOfferStatus(request.getRelatedOfferId(), "ACCEPTED");
            } else if (messageType == MessageType.OFFER_REJECTED) {
                messageBuilder.offerStatus("REJECTED");
                updateOriginalOfferStatus(request.getRelatedOfferId(), "REJECTED");
            }
        }

        Message message = messageBuilder.build();
        messageRepository.save(message);
        log.info("Message saved with ID: {}, type: {}", message.getId(), messageType);

        conversation.setLastMessageId(String.valueOf(message.getId()));
        conversation.setLastMessageTimestamp(Instant.now());
        conversationRepository.save(conversation);

        // Build notification
        String notificationTitle = getNotificationTitle(messageType);
        String notificationContent = getNotificationContent(request, messageType);

        NotificationMessage notification = NotificationMessage.builder()
                .notificationId(UUID.randomUUID().toString())
                .recipientId(request.getRecipientId())
                .title(notificationTitle)
                .content(notificationContent)
                .type(EventType.NEW_MESSAGE)
                .actorUserId(request.getSenderId())
                .data(Map.of("conversationId", conversation.getId(),
                        "senderId", request.getSenderId(),
                        "messageType", messageType.name()))
                .build();

        messagePublisher.publishNotificationMessage(notification);
        log.info("Notification published for message ID: {}", message.getId());

        return ApiResponse.<MessageResponse>builder()
                .message("Send message successfully")
                .data(messageMapper.toResponse(message))
                .status(OK.value())
                .build();
    }

    private boolean isPriceOfferType(MessageType type) {
        return type == MessageType.PRICE_OFFER || 
               type == MessageType.OFFER_ACCEPTED || 
               type == MessageType.OFFER_REJECTED || 
               type == MessageType.OFFER_COUNTERED;
    }

    private void updateOriginalOfferStatus(String offerId, String status) {
        if (offerId == null || offerId.isBlank()) return;
        
        messageRepository.findById(offerId).ifPresent(originalOffer -> {
            originalOffer.setOfferStatus(status);
            messageRepository.save(originalOffer);
            log.info("Updated original offer {} status to {}", offerId, status);
        });
    }

    private String getNotificationTitle(MessageType type) {
        return switch (type) {
            case PRICE_OFFER -> "Đề xuất giá mới";
            case OFFER_ACCEPTED -> "Đề xuất giá được chấp nhận";
            case OFFER_REJECTED -> "Đề xuất giá bị từ chối";
            case OFFER_COUNTERED -> "Đề xuất giá mới từ người bán";
            default -> "Tin nhắn mới";
        };
    }

    private String getNotificationContent(SendMessageRequest request, MessageType type) {
        if (isPriceOfferType(type) && request.getOfferPrice() != null) {
            String formattedPrice = String.format("%,.0f đ", request.getOfferPrice());
            return switch (type) {
                case PRICE_OFFER -> "Đề xuất giá: " + formattedPrice;
                case OFFER_ACCEPTED -> "Đã chấp nhận giá: " + formattedPrice;
                case OFFER_REJECTED -> "Đã từ chối đề xuất giá";
                case OFFER_COUNTERED -> "Đề xuất giá mới: " + formattedPrice;
                default -> request.getContent();
            };
        }
        return request.getContent();
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
