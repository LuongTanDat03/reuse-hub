package vn.tphcm.auctionservice.dtos.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceBidRequest {

    @NotNull(message = "Số tiền đấu giá không được để trống")
    @Min(value = 1000, message = "Số tiền đấu giá tối thiểu 1,000đ")
    private Long amount;

    // Giá tối đa cho auto-bid (optional)
    private Long maxAutoBid;
}
