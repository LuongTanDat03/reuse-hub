/*
 * @ (#) WebSocketConfig.java       1.0     10/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/12/2025
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j(topic = "WEBSOCKET-CONFIG")
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${websocket.allow-origin}")
    private String allowedOrigins;

    @Value("${websocket.endpoint}")
    private String endpoint;

    @Value("${websocket.destination-prefix}")
    private String destinationPrefix;

    @Value("${websocket.application-prefix}")
    private String applicationPrefix;

    @Value("${websocket.user-destination-prefix}")
    private String userDestinationPrefix;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(destinationPrefix.split(","));

        registry.setApplicationDestinationPrefixes(applicationPrefix);

        registry.setUserDestinationPrefix(userDestinationPrefix);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering STOMP endpoint at: {}", endpoint);
        registry.addEndpoint(endpoint)
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
    }
}
