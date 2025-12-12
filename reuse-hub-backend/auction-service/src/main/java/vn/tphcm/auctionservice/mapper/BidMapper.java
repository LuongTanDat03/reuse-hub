package vn.tphcm.auctionservice.mapper;

import org.mapstruct.*;
import vn.tphcm.auctionservice.dtos.response.BidResponse;
import vn.tphcm.auctionservice.models.Bid;

@Mapper(componentModel = "spring")
public interface BidMapper {

    @Mapping(target = "auctionId", source = "auction.id")
    @Mapping(target = "bidderName", ignore = true)
    @Mapping(target = "bidderAvatar", ignore = true)
    BidResponse toResponse(Bid bid);
}
