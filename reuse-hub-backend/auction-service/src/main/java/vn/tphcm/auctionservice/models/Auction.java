package vn.tphcm.auctionservice.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.tphcm.auctionservice.commons.AuctionStatus;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_auctions", indexes = {
        @Index(name = "idx_auction_seller", columnList = "sellerId"),
        @Index(name = "idx_auction_item", columnList = "itemId"),
        @Index(name = "idx_auction_status", columnList = "status"),
        @Index(name = "idx_auction_end_time", columnList = "endTime")
})
@Builder
public class Auction extends AbstractEntity<String> implements Serializable {

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Column(name = "starting_price", nullable = false)
    private Long startingPrice;

    @Column(name = "current_price", nullable = false)
    private Long currentPrice;

    @Column(name = "bid_increment", nullable = false)
    private Long bidIncrement;

    @Column(name = "buy_now_price")
    private Long buyNowPrice;

    @Column(name = "reserve_price")
    private Long reservePrice;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.PENDING;

    @Column(name = "bid_count")
    @Builder.Default
    private Integer bidCount = 0;

    @Column(name = "winner_id")
    private String winnerId;

    @Column(name = "winning_bid_id")
    private String winningBidId;

    @Column(name = "category_id")
    private String categoryId;

    private String address;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Bid> bids = new ArrayList<>();

    public void incrementBidCount() {
        this.bidCount = (this.bidCount == null ? 0 : this.bidCount) + 1;
    }
}
