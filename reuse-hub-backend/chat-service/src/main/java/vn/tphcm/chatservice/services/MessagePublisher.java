/*
 * @ (#) MessagePublisher.java       1.0     10/14/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 10/14/2025
 */

import vn.tphcm.event.dto.MessageEvent;
import vn.tphcm.event.dto.PresenceEvent;
import vn.tphcm.event.dto.TypingEvent;

public interface MessagePublisher {
    void publishMessage(MessageEvent event);
    void publishPresence(PresenceEvent event);
    void publishTyping(TypingEvent event);

}
