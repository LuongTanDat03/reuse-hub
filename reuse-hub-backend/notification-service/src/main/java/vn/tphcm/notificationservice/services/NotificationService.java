package vn.tphcm.notificationservice.services;

import vn.tphcm.notificationservice.models.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(String userId, String title, String message, String type, String relatedId);

    List<Notification> getUserNotifications(String userId);

    long countUnread(String userId);

    void markAsRead(String notificationId);

    void markAllAsRead(String userId);
}

