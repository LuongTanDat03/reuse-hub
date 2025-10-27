/*
 * @ (#) PresenceEvent.java       1.0     10/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 10/13/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.tphcm.chatservice.commons.UserStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PresenceEvent {
    private String userId;

    private String username;

    private UserStatus status;

    private String conversationId;
}
