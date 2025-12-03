/*
 * @ (#) EventMessage.java       1.0     9/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 9/20/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventMessage {
    private String eventId;
    private String eventType;
    private String itemId;
    private String itemTitle;
    private String itemOwnerId;
    private String actorUserId; // The user who performed the action
    private String category;
    private List<String> tags;
    private List<String> images;
    private Object data;
}
