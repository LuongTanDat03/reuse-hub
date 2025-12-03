/*
 * @ (#) RecommendationServiceImpl.java       1.0     11/21/2025
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
import org.springframework.stereotype.Service;
import vn.tphcm.recommendationservice.models.ItemNode;
import vn.tphcm.recommendationservice.repositories.RecommendationRepository;
import vn.tphcm.recommendationservice.services.RecommendationService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "RECOMMEMDATION-SERVICE")
public class RecommendationServiceImpl implements RecommendationService {
    private final RecommendationRepository recommendationRepository;

    private static final int WEIGHT_VIEW = 1;
    private static final int WEIGHT_LIKE = 3;
    private static final int WEIGHT_BUY = 10;

    @Override
    public void handleItemCreated(String itemId, String category, List<String> tags) {
        recommendationRepository.saveItem(itemId, category, tags);
    }

    @Override
    public void handleInteraction(String userId, String itemId, String eventType) {
        recommendationRepository.saveUser(userId);

        int weight = WEIGHT_VIEW;
        if ("ITEM_LIKED".equals(eventType)) weight = WEIGHT_LIKE;

        recommendationRepository.saveInteraction(userId, itemId, eventType, weight);
    }

    @Override
    public void handlePurchase(String userId, String itemId) {
        recommendationRepository.saveUser(userId);
        recommendationRepository.saveInteraction(userId, itemId, "PURCHASED", WEIGHT_BUY);
    }

    @Override
    public List<ItemNode> getRecommendations(String userId) {
        return recommendationRepository.getHybridRecommendations(userId, 10);
    }
}
