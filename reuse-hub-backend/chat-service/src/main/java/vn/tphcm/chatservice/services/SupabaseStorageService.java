/*
 * @ (#) SupabaseService.java       1.0     11/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services;

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.chatservice.dtos.response.ImageUploadResponse;

import java.util.List;

/*
 * @author: Luong Tan Dat
 * @date: 11/13/2025
 */
public interface SupabaseStorageService {
    ImageUploadResponse uploadImage(MultipartFile file, String folder);

    List<ImageUploadResponse> uploadImages(List<MultipartFile> files, String folder);

    void deleteImage(String objectPath);

    void deleteImages(List<String> objectPaths);
}
