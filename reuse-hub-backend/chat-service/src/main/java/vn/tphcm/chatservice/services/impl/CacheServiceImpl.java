/*
 * @ (#) CacheServiceImpl.java       1.0     10/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 10/6/2025
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.services.CacheService;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "CACHE-SERVICE")
public class CacheServiceImpl implements CacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CHAT_KEY_PREFIX = "chat:message:";
    private static final String USER_ONLINE_KEY = "chat:users:online";
    private static final String CONVERSATION_USERS_KEY_PREFIX = "chat:conversation:users:";
    private static final String TYPING_PREFIX = "chat:typing:";

    private static final Duration DEFAULT_TTL = Duration.ofMinutes(30);
    private static final Duration USER_ONLINE_TTL = Duration.ofMinutes(10);

    @Override
    public void cacheMessage(String messageId, MessageResponse response) {
        try {
            String key = CHAT_KEY_PREFIX + messageId;
            redisTemplate.opsForValue().set(key, response, DEFAULT_TTL);
            log.info("Cached chat {} with key {}", messageId, key);
        } catch (Exception e) {
            log.error("Failed to cache chat {}: {}", messageId, e.getMessage());
        }
    }

    @Override
    public MessageResponse getMessage(String messageId) {
        try {
            String key = CHAT_KEY_PREFIX + messageId;
            Object cachedData = redisTemplate.opsForValue().get(key);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, MessageResponse.class);
            }
        } catch (Exception e) {
            log.error("Failed to get cached chat {}: {}", messageId, e.getMessage());
        }

        return null;
    }

    @Override
    public void evictMessage(String messageId) {
        try {
            String key = CHAT_KEY_PREFIX + messageId;
            redisTemplate.delete(key);
            log.info("Evicted chat cache for key {}", key);
        } catch (Exception e) {
            log.error("Failed to evict chat cache for {}: {}", messageId, e.getMessage());
        }
    }

    @Override
    public void setUserOnline(String userId) {
        try {
            String key = USER_ONLINE_KEY + userId;
            redisTemplate.opsForValue().set(key, "online", USER_ONLINE_TTL);
            log.info("Set user {} online", userId);
        } catch (Exception e) {
            log.error("Failed to set user {} online: {}", userId, e.getMessage());
        }
    }

    @Override
    public void setUserOffline(String userId) {
        try {
            String key = USER_ONLINE_KEY + userId;
            redisTemplate.delete(key);
            log.info("Set user {} offline", userId);
        } catch (Exception e) {
            log.error("Failed to set user {} offline: {}", userId, e.getMessage());
        }
    }

    @Override
    public boolean isUserOnline(String userId) {
        try {
            String key = USER_ONLINE_KEY + userId;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));

        } catch (Exception e) {
            log.error("Failed to check if user {} is online: {}", userId, e.getMessage());
            return false;
        }
    }

    @Override
    public Set<String> getOnlineUsers() {
        try {
            Set<String> keys = redisTemplate.keys(USER_ONLINE_KEY + "*");
            return keys.stream()
                    .map(key -> key.replace(USER_ONLINE_KEY, ""))
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            log.error("Failed to get online users: {}", e.getMessage());
            return Set.of();
        }
    }

    @Override
    public void addUserToConversation(String conversationId, String userId) {
        try {
            String key = CONVERSATION_USERS_KEY_PREFIX + conversationId;
            redisTemplate.opsForSet().add(key, userId);
            redisTemplate.expire(key, Duration.ofHours(1));
            log.info("Added user {} to conversation {}", userId, conversationId);
        } catch (Exception e) {
            log.error("Failed to add user {} to conversation {}: {}", userId, conversationId, e.getMessage());
        }
    }

    @Override
    public void removeUserFromConversation(String conversationId, String userId) {
        try {
            String key = CONVERSATION_USERS_KEY_PREFIX + conversationId;
            redisTemplate.opsForSet().remove(key, userId);
            log.info("Removed user {} from conversation {}", userId, conversationId);
        } catch (Exception e) {
            log.error("Failed to remove user {} from conversation {}: {}", userId, conversationId, e.getMessage());
        }
    }

    @Override
    public Set<String> getConversationUsers(String conversationId) {
        try {
            String key = CONVERSATION_USERS_KEY_PREFIX + conversationId;
            Set<Object> members = redisTemplate.opsForSet().members(key);
            if (members != null) {
                return members.stream()
                        .map(Object::toString)
                        .collect(Collectors.toSet());
            } else {
                return Set.of();
            }
        } catch (Exception e) {
            log.error("Failed to get users in conversation {}: {}", conversationId, e.getMessage());
            return Set.of();
        }
    }

    @Override
    public void setUserTyping(String conversationId, String userId, Duration ttl) {
        try {
            String key = TYPING_PREFIX + conversationId;
            redisTemplate.opsForSet().add(key, userId);
            redisTemplate.expire(key, ttl);
        } catch (Exception e) {
            log.error("Error setting user typing {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public void setUserStoppedTyping(String conversationId, String userId) {
          try {
            String key = TYPING_PREFIX + conversationId;
            redisTemplate.opsForSet().remove(key, userId);
        } catch (Exception e) {
            log.error("Error setting user stopped typing {}: {}", userId, e.getMessage());
        }
    }

    @Override
    public Set<String> getTypingUsers(String conversationId) {
        try {
            String key = TYPING_PREFIX + conversationId;
            return redisTemplate.opsForSet().members(key).stream()
                    .map(Object::toString)
                    .collect(java.util.stream.Collectors.toSet());
        } catch (Exception e) {
            log.error("Error getting typing users {}: {}", conversationId, e.getMessage());
            return Set.of();
        }
    }
}
