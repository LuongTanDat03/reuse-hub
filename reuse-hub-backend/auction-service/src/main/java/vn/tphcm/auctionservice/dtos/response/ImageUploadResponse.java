package vn.tphcm.auctionservice.dtos.response;

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
