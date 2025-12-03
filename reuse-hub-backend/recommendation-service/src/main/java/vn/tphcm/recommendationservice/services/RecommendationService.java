/*
 * @ (#) RecommendationService.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.services;

import vn.tphcm.recommendationservice.models.ItemNode;

import java.util.List;

/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */
public interface RecommendationService {
    void handleItemCreated(String itemId, String category, List<String> tags);

    void handleInteraction(String userId, String itemId, String eventType);

    void handlePurchase(String userId, String itemId);

    List<ItemNode> getRecommendations(String userId);
}
