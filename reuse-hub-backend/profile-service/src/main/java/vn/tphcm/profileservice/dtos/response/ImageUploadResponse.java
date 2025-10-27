/*
 * @ (#) ImageUploadResponse.java       1.0     10/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.dtos.response;
/*
 * @author: Luong Tan Dat
 * @date: 10/3/2025
 */

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageUploadResponse {
    private String imageUrl;

    private String thumbnailUrl;

    private String fileName;

    private Long fileSize;
}
