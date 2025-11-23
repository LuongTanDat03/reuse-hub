/*
 * @ (#) GeminiService.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.services;

import java.util.List;

/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */
public interface GeminiService {
    List<String> generateTagsFromImage(String imageUrl);
}
