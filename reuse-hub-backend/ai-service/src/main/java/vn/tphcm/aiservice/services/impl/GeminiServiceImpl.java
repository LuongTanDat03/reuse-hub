/*
 * @ (#) GeminiServiceImpl.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import vn.tphcm.aiservice.services.GeminiService;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "GEMINI-SERVICE")
public class GeminiServiceImpl implements GeminiService {
    @Value("${google.ai.api-key}")
    private String apiKey;

    @Value("${google.ai.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    @Override
    public List<String> generateTagsFromImage(String imageUrl) {
        log.info("Generating tags for image: {}", imageUrl);
        try {
            String base64Image = downloadAndEncodeImage(imageUrl);
            if (base64Image == null) return new ArrayList<>();

            Map<String, Object> requestBody = getStringObjectMap(base64Image);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            return parseGeminiResponse(response);
        }catch (Exception ex){
            log.error("Error generating tags: {}", ex.getMessage());
            return new ArrayList<>();
        }
    }

    private static Map<String, Object> getStringObjectMap(String base64Image) {
        String prompt = "List 5 Vietnamese keywords describing the object in this image, comma separated, lowercase, different on the subject, no explanation.";

        return Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt),
                    Map.of("inline_data", Map.of(
                        "mime_type", "image/jpeg",
                        "data", base64Image
                    ))
                ))
            )
        );
    }

    private String downloadAndEncodeImage(String imageUrl) {
        try (InputStream in = URI.create(imageUrl).toURL().openStream()) {
            byte[] imageBytes = in.readAllBytes();
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            log.error("Failed to download image: {}", e.getMessage());
            return null;
        }
    }

    private List<String> parseGeminiResponse(Map response) {
        try {
            List candidates = (List) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                List parts = (List) content.get("parts");
                Map part = (Map) parts.get(0);
                String text = (String) part.get("text");

                return Arrays.stream(text.split(","))
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .toList();
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
        }
        return new ArrayList<>();
    }
}