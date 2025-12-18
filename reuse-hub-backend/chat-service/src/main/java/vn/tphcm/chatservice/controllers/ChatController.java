/*
 * @ (#) ChatController.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.tphcm.chatservice.dtos.ApiResponse;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.services.ConversationService;
import vn.tphcm.chatservice.services.MessageService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Slf4j(topic = "CHAT-CONTROLLER")
public class ChatController {
    private final MessageService messageService;
    private final SimpMessagingTemplate template;

    /**
     * REST endpoint for sending messages (fallback when WebSocket is not available)
     */
    @PostMapping("/messages/send")
    public ApiResponse<MessageResponse> sendMessageRest(@RequestBody SendMessageRequest request) {
        log.info("REST: Received message send request: {}", request);

        ApiResponse<MessageResponse> messageResponse = messageService.sendMessage(request);
        MessageResponse messageData = messageResponse.getData();

        // Also broadcast via WebSocket for real-time updates
        template.convertAndSend(
                "/topic/messages/" + request.getRecipientId(),
                messageData
        );
        template.convertAndSend(
                "/topic/messages/" + request.getSenderId(),
                messageData
        );

        return messageResponse;
    }

    @MessageMapping("/send-message")
    @SendToUser("/queue/responses")
    public Map<String, Object> sendMessage(@Payload SendMessageRequest request){
        log.info("Received message send request: {}", request);

        try {
            ApiResponse<MessageResponse> messageResponse = messageService.sendMessage(request);
            MessageResponse messageData = messageResponse.getData();

            template.convertAndSend(
                    "/topic/messages/" + request.getRecipientId(),
                    messageData
            );
            log.info("Message sent to recipient topic {}: {}", request.getRecipientId(), messageData);

            template.convertAndSend(
                    "/topic/messages/" + request.getSenderId(),
                    messageData
            );
            log.info("Message sent to sender topic {}: {}", request.getSenderId(), messageData);

            return Map.of("status", "success", "message", "Message sent successfully");
        } catch (Exception ex) {
            log.error("Error while sending message: {}", ex.getMessage());
            return Map.of("status", "error", "message", ex.getMessage());
        }
    }
}
