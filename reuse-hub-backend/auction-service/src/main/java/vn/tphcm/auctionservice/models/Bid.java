package vn.tphcm.auctionservice.models;

import jakarta.persistence.*;
import lombok.*;
import vn.tphcm.auctionservice.commons.BidStatus;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_bids", indexes = {
        @Index(name = "idx_bid_auction", columnList = "auction_id"),
        @Index(name = "idx_bid_bidder", columnList = "bidderId"),
        @Index(name = "idx_bid_amount", columnList = "amount")
})
@Builder
public class Bid extends AbstractEntity<String> implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @Column(name = "bidder_id", nullable = false)
    private String bidderId;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "max_auto_bid")
    private Long maxAutoBid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BidStatus status = BidStatus.ACTIVE;

    @Column(name = "is_auto_bid")
    @Builder.Default
    private Boolean isAutoBid = false;
}
