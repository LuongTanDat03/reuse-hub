/*
 * @ (#) ItemResponse.java       1.0     9/19/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.dto.response;
/*
 * @author: Luong Tan Dat
 * @date: 9/19/2025
 */

import lombok.*;
import vn.tphcm.adminservice.commons.ItemStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {
    private String id;

    private String userId;

    private String title;

    private String description;

    private List<String> images;

    private List<String> tags;

    private String address;

    private LocationResponse location;

    private ItemStatus status;

    private Long price;

    private int viewCount;

    private int commentCount;

    private int likeCount;

    private List<CommentResponse> comments;

    private List<RatingResponse> ratings;

    private String category;

    private String categorySlug;
}
