/*
 * @ (#) NotificationEvent.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import lombok.*;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationEvent {
    private String channel;
    private String recipient;
    private String templateCode;
    private Map<String, Object> param;
    private String subject;
    private String body;
}
