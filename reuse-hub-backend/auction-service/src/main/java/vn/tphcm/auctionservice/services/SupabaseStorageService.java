package vn.tphcm.auctionservice.services;

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.auctionservice.dtos.response.ImageUploadResponse;

import java.util.List;

public interface SupabaseStorageService {
    ImageUploadResponse uploadImage(MultipartFile file, String folder);
    List<ImageUploadResponse> uploadImages(List<MultipartFile> files, String folder);
    void deleteImage(String imageUrl);
    void deleteImages(List<String> imageUrls);
}
