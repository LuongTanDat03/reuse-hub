/*
 * @ (#) AwsServiceImpl.java       1.0     9/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 9/12/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import vn.tphcm.profileservice.exceptions.UploadFileFailedException;
import vn.tphcm.profileservice.services.AwsService;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AWS-SERVICE")
public class AwsServiceImpl implements AwsService {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.base-url}")
    private String baseUrl;

    private static final List<String> whiteListImageExtensions = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"
    );

    private static final long maxFileSize = 5 * 1024 * 1024; // 5MB

    @Override
    public String uploadFile(MultipartFile files, String folder) {
        try {
            if (!isValidImageFile(files)) {
                throw new UploadFileFailedException("Invalid file. Please upload a valid image file.");
            }

            String fileName = generateFileUrl(files.getOriginalFilename(), folder);
            String key = folder + "/" + fileName;

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(files.getContentType())
                    .contentLength(files.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(files.getInputStream(), files.getSize()));

            String fileUrl = baseUrl + "/" + key;
            log.info("File uploaded successfully to S3: {}", fileUrl);

            return fileUrl;

        } catch (Exception e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new UploadFileFailedException("Failed to upload file");
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith(baseUrl)) {
                String key = fileUrl.replace(baseUrl + "/", "");

                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

                s3Client.deleteObject(deleteObjectRequest);
                log.info("File deleted successfully: {}", fileUrl);
            }
        } catch (Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage());
            throw new UploadFileFailedException("Failed to delete file");
        }
    }

    @Override
    public String generateFileUrl(String originalFileName, String folder) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("File is null or empty");
            return false;
        }

        if (file.getSize() > maxFileSize) {
            log.warn("File size exceeds the maximum limit of {} bytes", maxFileSize);
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null || !whiteListImageExtensions.contains(contentType.toLowerCase())) {
            log.warn("Invalid file type: {}", contentType);
            return false;
        }

        return true;
    }
}
