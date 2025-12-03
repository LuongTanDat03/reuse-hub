/*
 * @ (#) MessageConsumerImpl.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import vn.tphcm.recommendationservice.services.MessageConsumer;
import vn.tphcm.recommendationservice.services.RecommendationService;

import java.util.LinkedHashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONSUMER")
public class MessageConsumerImpl implements MessageConsumer {
    private final RecommendationService recommendationService;

    @Override
    @RabbitListener(queues = "q.recommendation.events")
    public void handleEvent(Object message) {
        try{
            if (message instanceof LinkedHashMap){
                LinkedHashMap<String, Object> msg = (LinkedHashMap<String, Object>) message;
                String eventType = (String) msg.get("eventType");
                switch (eventType) {
                    case "ITEM_CREATED" -> {
                        String itemId = (String) msg.get("itemId");
                        String category = (String) msg.get("category");
                        var tags = (List<String>) msg.get("tags");
                        recommendationService.handleItemCreated(itemId, category, tags);
                    }
                    case "ITEM_VIEWED", "ITEM_LIKED" -> {
                        String userId = (String) msg.get("userId");
                        String itemId = (String) msg.get("itemId");
                        recommendationService.handleInteraction(userId, itemId, eventType);
                    }
                    case "PURCHASED" -> {
                        String userId = (String) msg.get("userId");
                        String itemId = (String) msg.get("itemId");
                        recommendationService.handlePurchase(userId, itemId);
                    }
                    default -> log.warn("Unknown event type: {}", eventType);
                }
            }
        }catch(Exception e) {
            log.error("Error handling message: {}", e.getMessage());
        }
    }
}
