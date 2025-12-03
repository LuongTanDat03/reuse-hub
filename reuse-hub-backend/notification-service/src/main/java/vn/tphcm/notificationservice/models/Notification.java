package vn.tphcm.notificationservice.models;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type; 
    private String relatedId; 
    private boolean isRead;
    private Map<String, Object> metadata;

    @CreatedDate
    private LocalDateTime createdAt;
}

