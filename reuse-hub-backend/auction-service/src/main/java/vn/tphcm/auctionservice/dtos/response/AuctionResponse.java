package vn.tphcm.auctionservice.dtos.response;

import lombok.*;
import vn.tphcm.auctionservice.commons.AuctionStatus;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionResponse {
    private String id;
    private String itemId;
    private String sellerId;
    private String sellerName;
    private String sellerAvatar;
    private String title;
    private String description;
    private List<String> images;
    private Long startingPrice;
    private Long currentPrice;
    private Long bidIncrement;
    private Long buyNowPrice;
    private Long reservePrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private Integer bidCount;
    private Integer uniqueBidders;
    private String winnerId;
    private String winnerName;
    private String categoryId;
    private String categoryName;
    private String address;
    private Long timeRemaining; // seconds
    private Boolean isUserHighestBidder;
    private Long userHighestBid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
