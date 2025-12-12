package vn.tphcm.auctionservice.dtos.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAuctionRequest {

    private String itemId;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 10, max = 200, message = "Tiêu đề phải từ 10-200 ký tự")
    private String title;

    @Size(max = 5000, message = "Mô tả tối đa 5000 ký tự")
    private String description;

    private List<String> images;

    @NotNull(message = "Giá khởi điểm không được để trống")
    @Min(value = 1000, message = "Giá khởi điểm tối thiểu 1,000đ")
    private Long startingPrice;

    @NotNull(message = "Bước giá không được để trống")
    @Min(value = 1000, message = "Bước giá tối thiểu 1,000đ")
    private Long bidIncrement;

    @Min(value = 0, message = "Giá mua ngay phải lớn hơn 0")
    private Long buyNowPrice;

    @Min(value = 0, message = "Giá sàn phải lớn hơn 0")
    private Long reservePrice;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    private String categoryId;

    private String address;
}
