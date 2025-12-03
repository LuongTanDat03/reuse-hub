package vn.tphcm.chatservice.configs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j(topic = "WEBSOCKET-AUTH-INTERCEPTOR")
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("Intercepting STOMP CONNECT command. Headers: {}", accessor.getNativeHeader("Headers"));

            List<String> authorization = accessor.getNativeHeader("Authorization");

            if (authorization != null && !authorization.isEmpty()) {
                String authHeader = authorization.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    try {
                        String userId = extractUserIdFromToken(token);
                        if (userId != null && !userId.isBlank()) {
                            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                    userId, null, Collections.singletonList(new SimpleGrantedAuthority("USER")));
                            accessor.setUser(authentication);
                            log.info("Successfully authenticated WebSocket for user: {}", userId);
                        }
                    } catch (Exception e) {
                        log.error("Failed to authenticate WebSocket connection from token: {}", e.getMessage());
                    }
                }
            } else {
                log.warn("WebSocket CONNECT command missing 'Authorization' header.");
            }
        }
        return message;
    }

    private String extractUserIdFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                log.error("Invalid JWT token format, not enough parts.");
                return null;
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(parts[1]));

            if (payload.contains("\"sub\"")) {
                int start = payload.indexOf("\"sub\":\"") + 7;
                int end = payload.indexOf("\"", start);
                return payload.substring(start, end);
            }

            log.warn("Claim 'sub' not found in JWT payload for WebSocket auth.");
            return null;
        } catch (Exception e) {
            log.error("Error decoding JWT payload for WebSocket: {}", e.getMessage());
            return null;
        }
    }
}