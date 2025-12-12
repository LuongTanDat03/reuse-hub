package vn.tphcm.auctionservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.tphcm.auctionservice.models.Auction;
import vn.tphcm.auctionservice.models.Bid;
import vn.tphcm.auctionservice.services.MessageProducer;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUCTION-MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-key.notification.auction}")
    private String auctionNotificationRoutingKey;

    @Override
    public void sendAuctionCreatedEvent(Auction auction) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "AUCTION_CREATED");
        message.put("auctionId", auction.getId());
        message.put("sellerId", auction.getSellerId());
        message.put("title", auction.getTitle());
        message.put("startingPrice", auction.getStartingPrice());
        message.put("endTime", auction.getEndTime().toString());

        sendNotification(message);
        log.info("Sent auction created event for auction: {}", auction.getId());
    }

    @Override
    public void sendBidPlacedEvent(Auction auction, Bid bid) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "BID_PLACED");
        message.put("auctionId", auction.getId());
        message.put("bidId", bid.getId());
        message.put("bidderId", bid.getBidderId());
        message.put("amount", bid.getAmount());
        message.put("currentPrice", auction.getCurrentPrice());
        message.put("bidCount", auction.getBidCount());

        sendNotification(message);
        log.info("Sent bid placed event for auction: {}, bid: {}", auction.getId(), bid.getId());
    }

    @Override
    public void sendOutbidNotification(Auction auction, String outbidUserId, Long newBidAmount) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "OUTBID");
        message.put("auctionId", auction.getId());
        message.put("userId", outbidUserId);
        message.put("title", auction.getTitle());
        message.put("newBidAmount", newBidAmount);
        message.put("message", "Bạn đã bị vượt qua trong phiên đấu giá \"" + auction.getTitle() + 
                "\". Giá mới: " + formatPrice(newBidAmount));

        sendNotification(message);
        log.info("Sent outbid notification to user: {} for auction: {}", outbidUserId, auction.getId());
    }

    @Override
    public void sendAuctionEndedEvent(Auction auction) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "AUCTION_ENDED");
        message.put("auctionId", auction.getId());
        message.put("sellerId", auction.getSellerId());
        message.put("winnerId", auction.getWinnerId());
        message.put("finalPrice", auction.getCurrentPrice());
        message.put("status", auction.getStatus().name());

        sendNotification(message);
        log.info("Sent auction ended event for auction: {}", auction.getId());

        // Send winner notification if there's a winner
        if (auction.getWinnerId() != null) {
            sendAuctionWonNotification(auction, auction.getWinnerId());
        }
    }

    @Override
    public void sendAuctionWonNotification(Auction auction, String winnerId) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "AUCTION_WON");
        message.put("auctionId", auction.getId());
        message.put("userId", winnerId);
        message.put("title", auction.getTitle());
        message.put("finalPrice", auction.getCurrentPrice());
        message.put("message", "Chúc mừng! Bạn đã thắng phiên đấu giá \"" + auction.getTitle() + 
                "\" với giá " + formatPrice(auction.getCurrentPrice()));

        sendNotification(message);
        log.info("Sent auction won notification to user: {} for auction: {}", winnerId, auction.getId());
    }

    private void sendNotification(Map<String, Object> message) {
        try {
            rabbitTemplate.convertAndSend(notificationExchange, auctionNotificationRoutingKey, message);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
    }

    private String formatPrice(Long price) {
        return String.format("%,d", price) + "đ";
    }
}
