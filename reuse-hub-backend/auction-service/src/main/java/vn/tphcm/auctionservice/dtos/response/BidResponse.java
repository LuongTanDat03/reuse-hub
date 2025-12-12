package vn.tphcm.auctionservice.dtos.response;

import lombok.*;
import vn.tphcm.auctionservice.commons.BidStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidResponse {
    private String id;
    private String auctionId;
    private String bidderId;
    private String bidderName;
    private String bidderAvatar;
    private Long amount;
    private BidStatus status;
    private Boolean isAutoBid;
    private LocalDateTime createdAt;
}
