/*
 * @ (#) NotificationController.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import com.rabbitmq.client.Channel;
import event.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.notificationservice.configs.RabbitMQConfig;
import vn.tphcm.notificationservice.models.Notification;
import vn.tphcm.notificationservice.services.EmailService;
import vn.tphcm.notificationservice.services.NotificationService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
@Slf4j(topic = "NOTIFICATION-CONTROLLER")
public class NotificationController {
    private final EmailService emailService;
    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.Q_VERIFICATION)
    public void listenVerificationEmailQueue(NotificationEvent event, Message message, Channel channel) throws Exception {
        emailService.sendVerificationEmail(
                event,
                message,
                channel
        );
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("X-User-Id") String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("X-User-Id") String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("X-User-Id") String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
