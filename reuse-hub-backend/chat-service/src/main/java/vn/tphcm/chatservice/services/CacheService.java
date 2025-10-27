/*
 * @ (#) CacheService.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */


import vn.tphcm.chatservice.dtos.response.MessageResponse;

import java.time.Duration;
import java.util.Set;

public interface CacheService {
    void cacheMessage(String messageId, MessageResponse response);

    MessageResponse getMessage(String messageId);

    void evictMessage(String messageId);

    void setUserOnline(String userId);

    void setUserOffline(String userId);

    boolean isUserOnline(String userId);

    Set<String> getOnlineUsers();

    void addUserToConversation(String conversationId, String userId);

    void removeUserFromConversation(String conversationId, String userId);

    Set<String> getConversationUsers(String conversationId);

    void setUserTyping(String conversationId, String userId, Duration ttl);

    void setUserStoppedTyping(String conversationId, String userId);

    Set<String> getTypingUsers(String conversationId);

}
