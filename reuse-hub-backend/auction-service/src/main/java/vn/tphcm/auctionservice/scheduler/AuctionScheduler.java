package vn.tphcm.auctionservice.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.tphcm.auctionservice.services.AuctionService;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "AUCTION-SCHEDULER")
public class AuctionScheduler {

    private final AuctionService auctionService;

    /**
     * Check and process ended auctions every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    public void processEndedAuctions() {
        log.debug("Running scheduled task: processEndedAuctions");
        auctionService.processEndedAuctions();
    }

    /**
     * Check and activate pending auctions every minute
     */
    @Scheduled(fixedRate = 60000)
    public void processStartingAuctions() {
        log.debug("Running scheduled task: processStartingAuctions");
        auctionService.processStartingAuctions();
    }
}
