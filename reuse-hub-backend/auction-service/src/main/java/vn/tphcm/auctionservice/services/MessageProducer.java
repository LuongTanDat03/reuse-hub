package vn.tphcm.auctionservice.services;

import vn.tphcm.auctionservice.models.Auction;
import vn.tphcm.auctionservice.models.Bid;

public interface MessageProducer {
    void sendAuctionCreatedEvent(Auction auction);
    void sendBidPlacedEvent(Auction auction, Bid bid);
    void sendOutbidNotification(Auction auction, String outbidUserId, Long newBidAmount);
    void sendAuctionEndedEvent(Auction auction);
    void sendAuctionWonNotification(Auction auction, String winnerId);
}
