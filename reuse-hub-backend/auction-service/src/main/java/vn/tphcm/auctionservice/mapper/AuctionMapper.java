package vn.tphcm.auctionservice.mapper;

import org.mapstruct.*;
import vn.tphcm.auctionservice.dtos.request.CreateAuctionRequest;
import vn.tphcm.auctionservice.dtos.response.AuctionResponse;
import vn.tphcm.auctionservice.models.Auction;

import java.time.Duration;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface AuctionMapper {
    @Mapping(target = "sellerId", ignore = true)
    @Mapping(target = "currentPrice", source = "startingPrice")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "bidCount", ignore = true)
    @Mapping(target = "winnerId", ignore = true)
    @Mapping(target = "winningBidId", ignore = true)
    @Mapping(target = "bids", ignore = true)
    Auction toEntity(CreateAuctionRequest request);

    @Mapping(target = "sellerName", ignore = true)
    @Mapping(target = "sellerAvatar", ignore = true)
    @Mapping(target = "uniqueBidders", ignore = true)
    @Mapping(target = "winnerName", ignore = true)
    @Mapping(target = "categoryName", ignore = true)
    @Mapping(target = "timeRemaining", expression = "java(calculateTimeRemaining(auction))")
    @Mapping(target = "isUserHighestBidder", ignore = true)
    @Mapping(target = "userHighestBid", ignore = true)
    AuctionResponse toResponse(Auction auction);

    default Long calculateTimeRemaining(Auction auction) {
        if (auction.getEndTime() == null) return 0L;
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(auction.getEndTime())) return 0L;
        return Duration.between(now, auction.getEndTime()).getSeconds();
    }
}
