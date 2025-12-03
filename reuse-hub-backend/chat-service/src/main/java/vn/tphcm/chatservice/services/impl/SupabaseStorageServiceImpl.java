/*
 * @ (#) SupabaseStorageServiceImpl.java       1.0     11/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/13/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.chatservice.configs.FileUploadConfig;
import vn.tphcm.chatservice.dtos.response.ImageUploadResponse;
import vn.tphcm.chatservice.exceptions.UploadFileFailedException;
import vn.tphcm.chatservice.services.SupabaseStorageService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "SUPABASE-STORAGE-SERVICE")
public class SupabaseStorageServiceImpl implements SupabaseStorageService {
    private final FileUploadConfig fileUploadConfig;
    private final OkHttpClient httpClient = new OkHttpClient().newBuilder()
            .connectTimeout(30, TimeUnit.MINUTES)
            .writeTimeout(30, TimeUnit.MINUTES)
            .readTimeout(30, TimeUnit.MINUTES)
            .build();

    @Value("${supabase.bucket}")
    private String bucketName;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.public-url}")
    private String publicUrl;

    @Override
    public ImageUploadResponse uploadImage(MultipartFile file, String folder) {
        log.info("Uploading single image: {} to Supabase Storage in folder: {}", file.getOriginalFilename(), folder);

        validateImage(file);

        try {
            String fileName = generateFileName(file.getOriginalFilename());
            String objectPath = joinPath(folder, fileName);

            byte[] bytes = file.getBytes();
            String ct = file.getContentType();

            MediaType mediaType = (ct != null) ? MediaType.get(ct) : MediaType.parse("application/octet-stream");
            RequestBody requestBody = RequestBody.create(
                    bytes, mediaType
            );

            HttpUrl url = Objects.requireNonNull(HttpUrl.parse(supabaseUrl))
                    .newBuilder()
                    .addPathSegments("storage/v1/object")
                    .addPathSegment(bucketName)
                    .addPathSegments(objectPath)
                    .build();

            Request request = new Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .addHeader("Authorization", "Bearer " + serviceKey)
                    .addHeader("apikey", serviceKey)
                    .addHeader("x-upsert", "true")
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("Failed to upload file: {}. Response code: {}, Body: {}", file.getOriginalFilename(), response.code(), errorBody);
                    throw new UploadFileFailedException("Failed to upload file: " + file.getOriginalFilename());
                }

                String imageUrl = getPublicUrl(objectPath);

                log.info("Successfully uploaded file: {} to Supabase Storage. URL: {}", file.getOriginalFilename(), imageUrl);

                return ImageUploadResponse.builder()
                        .fileName(fileName)
                        .imageUrl(imageUrl)
                        .fileSize(file.getSize())
                        .build();
            }

        } catch (Exception e) {
            log.error("Error uploading file: {}", file.getOriginalFilename(), e);
            throw new UploadFileFailedException("Error uploading file: " + file.getOriginalFilename());
        }
    }

    @Override
    public List<ImageUploadResponse> uploadImages(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) {
            throw new UploadFileFailedException("No files to upload");
        }

        log.info("Uploading {} files to Supabase Storage in folder: {}", files.size(), folder);

        if (files.size() > fileUploadConfig.getMaxImages()) {
            throw new UploadFileFailedException("Exceeded maximum number of files: " + fileUploadConfig.getMaxImages());
        }

        List<ImageUploadResponse> response = new ArrayList<>();
        List<String> uploadUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                ImageUploadResponse uploadResponse = uploadImage(file, folder);
                response.add(uploadResponse);
                uploadUrls.add(uploadResponse.getImageUrl());
            } catch (Exception e) {
                log.error("Error uploading file: {}", file.getOriginalFilename(), e);
                deleteImages(uploadUrls);
                throw new UploadFileFailedException("Error uploading file: " + file.getOriginalFilename());
            }
        }

        log.info("Successfully uploaded {} files to Supabase Storage", response.size());

        return response;
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new UploadFileFailedException("Object path is empty");
        }

        log.info("Deleting image at path: {} from Supabase Storage", imageUrl);

        try {
            String objectPath = extractPathFromUrl(imageUrl);

            Request request = new Request.Builder()
                    .url(supabaseUrl + "/storage/v1/object/" + bucketName + "/" + objectPath)
                    .delete()
                    .addHeader("Authorization", "Bearer " + serviceKey)
                    .addHeader("apikey", serviceKey)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("Successfully deleted file at path: {} from Supabase Storage", objectPath);
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("Failed to delete file at path: {}. Response code: {}, Body: {}", objectPath, response.code(), errorBody);
                    throw new UploadFileFailedException("Failed to delete file at path: " + objectPath);
                }
            }
        } catch (Exception e) {
            log.error("Error deleting file at path: {}", imageUrl, e);
            throw new UploadFileFailedException("Error deleting file at path: " + imageUrl);
        }
    }

    @Override
    public void deleteImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            throw new UploadFileFailedException("No object paths to delete");
        }

        log.info("Deleting {} images from Supabase Storage", imageUrls.size());

        for (String imageUrl : imageUrls) {
            try {
                deleteImage(imageUrl);
            } catch (Exception e) {
                log.error("Error deleting file at path: {}", imageUrl, e);
            }
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new UploadFileFailedException("File is empty");
        }

        if (file.getContentType() == null) {
            throw new UploadFileFailedException("Invalid file type. Only image files are allowed");
        }

        if (!fileUploadConfig.getAllowedTypes().contains(file.getContentType())) {
            throw new UploadFileFailedException("Unsupported file type: " + file.getContentType());
        }

        long maxSize = fileUploadConfig.getMaxSize() * 1024L * 1024L;
        if (file.getSize() > maxSize) {
            throw new UploadFileFailedException("File size exceeds the maximum limit of " + fileUploadConfig.getMaxSize() + " MB");
        }
    }

    private String generateFileName(String originalFilename) {
        log.info("Generating file name for original filename: {}", originalFilename);

        String extension = FilenameUtils.getExtension(originalFilename);
        return UUID.randomUUID().toString() + "_" + Instant.now().getEpochSecond() + "." + extension;
    }

    private String getPublicUrl(String objectPath) {
        String path = objectPath.replaceAll("^/+", "");
        return publicUrl.replaceAll("/+$", "") + "/" +
                bucketName + "/" + path;
    }

    private String joinPath(String... parts) {
        String joined = String.join("/", parts)
                .replaceAll("/{2,}", "/");
        return joined.replaceAll('^' + "/", "")
                .replaceAll("/$", "");
    }

    private String extractPathFromUrl(String url) {
        if (url.contains("storage/v1/object/public/")) {
            String[] parts = url.split("storage/v1/object/public/" + bucketName + "/");
            if (parts.length > 1) {
                return parts[1];
            }
        }
        return url;
    }
}
