/*
 * @ (#) FileUploadConfig.java       1.0     10/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/3/2025
 */

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "file.upload")
@Getter
@Setter
public class FileUploadConfig {
    @Value("${file.upload.max-size}")
    private int maxSize;

    @Value("${file.upload.allowed-types}")
    private List<String> allowedTypes;

    @Value("${file.upload.max-images}")
    private int maxImages;

    private Image image = new Image();

    @Getter
    @Setter
    public static class Image {
        @Value("${file.upload.image.max-width}")
        private int maxWidth;
        @Value("${file.upload.image.max-height}")
        private int maxHeight = 1080;
        @Value("${file.upload.image.thumbnail-size}")
        private int thumbnailSize = 300;
        @Value("${file.upload.image.compress-quality}")
        private double compressQuality = 0.8;
    }
}
