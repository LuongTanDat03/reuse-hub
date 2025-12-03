package vn.tphcm.notificationservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.tphcm.notificationservice.models.Notification;
import vn.tphcm.notificationservice.repositories.NotificationRepository;
import vn.tphcm.notificationservice.services.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "NOTIFICATION-SERVICE")
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(String userId, String title, String message, 
                                          String type, String relatedId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
