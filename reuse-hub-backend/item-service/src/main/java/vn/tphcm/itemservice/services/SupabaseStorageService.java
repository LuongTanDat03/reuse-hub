/*
 * @ (#) SupabaseStorageService.java       1.0     10/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 10/2/2025
 */


import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.itemservice.dtos.response.ImageUploadResponse;

import java.util.List;

public interface SupabaseStorageService {
    ImageUploadResponse uploadImage(MultipartFile file, String folder);

    List<ImageUploadResponse> uploadImages(List<MultipartFile> files, String folder);

    void deleteImage(String objectPath);

    void deleteImages(List<String> objectPaths);
}
