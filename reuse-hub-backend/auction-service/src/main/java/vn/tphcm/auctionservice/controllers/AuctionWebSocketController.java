package vn.tphcm.auctionservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import vn.tphcm.auctionservice.dtos.request.PlaceBidRequest;
import vn.tphcm.auctionservice.dtos.response.BidResponse;
import vn.tphcm.auctionservice.services.AuctionService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j(topic = "AUCTION-WEBSOCKET")
public class AuctionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionService auctionService;

    /**
     * Handle realtime bid placement via WebSocket
     * Client sends to: /app/auction/{auctionId}/bid
     * Broadcast to: /topic/auction/{auctionId}
     */
    @MessageMapping("/auction/{auctionId}/bid")
    @SendTo("/topic/auction/{auctionId}")
    public Map<String, Object> handleBid(
            @DestinationVariable String auctionId,
            Map<String, Object> bidMessage) {
        
        log.info("Received WebSocket bid for auction: {}", auctionId);
        
        String bidderId = (String) bidMessage.get("bidderId");
        Long amount = ((Number) bidMessage.get("amount")).longValue();
        
        PlaceBidRequest request = PlaceBidRequest.builder()
                .amount(amount)
                .build();
        
        var response = auctionService.placeBid(auctionId, bidderId, request);
        
        if (response.getStatus() == 200) {
            BidResponse bid = response.getData();
            return Map.of(
                    "type", "NEW_BID",
                    "auctionId", auctionId,
                    "bid", bid,
                    "message", response.getMessage()
            );
        } else {
            return Map.of(
                    "type", "BID_ERROR",
                    "auctionId", auctionId,
                    "error", response.getMessage()
            );
        }
    }

    /**
     * Broadcast auction update to all subscribers
     */
    public void broadcastAuctionUpdate(String auctionId, Map<String, Object> update) {
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId, update);
    }

    /**
     * Send notification to specific user
     */
    public void sendToUser(String userId, Map<String, Object> notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }
}
