/*
 * @ (#) RecommendationController.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.tphcm.recommendationservice.dtos.ApiResponse;
import vn.tphcm.recommendationservice.models.ItemNode;
import vn.tphcm.recommendationservice.services.RecommendationService;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Slf4j(topic = "RECOMMENDATION-CONTROLLER")
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping
    public ApiResponse<List<ItemNode>> getRecommendations(String userId) {
        log.info("Fetching recommendations for user: {}", userId);
        List<ItemNode> recommendations = recommendationService.getRecommendations(userId);
        return ApiResponse.<List<ItemNode>>builder()
                .status(OK.value())
                .message("Recommendations fetched successfully")
                .data(recommendations)
                .build();
    }
}
