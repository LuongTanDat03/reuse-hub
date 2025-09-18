/*
 * @ (#) AwsService.java       1.0     9/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/12/2025
 */

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface AwsService {
    String uploadFile(MultipartFile files, String folder);

    void deleteFile(String fileUrl);

    String generateFileUrl(String originalFileName, String folder);
}
