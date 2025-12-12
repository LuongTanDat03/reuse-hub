package vn.tphcm.auctionservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.auctionservice.models.Bid;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {

    Page<Bid> findByAuctionIdOrderByAmountDesc(String auctionId, Pageable pageable);

    List<Bid> findByAuctionIdOrderByAmountDesc(String auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.amount DESC LIMIT 1")
    Optional<Bid> findHighestBid(@Param("auctionId") String auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId AND b.bidderId = :bidderId ORDER BY b.amount DESC LIMIT 1")
    Optional<Bid> findHighestBidByUser(@Param("auctionId") String auctionId, @Param("bidderId") String bidderId);

    List<Bid> findByBidderId(String bidderId);

    @Query("SELECT COUNT(DISTINCT b.bidderId) FROM Bid b WHERE b.auction.id = :auctionId")
    Integer countUniqueBidders(@Param("auctionId") String auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId AND b.bidderId != :excludeBidderId ORDER BY b.amount DESC LIMIT 1")
    Optional<Bid> findSecondHighestBid(@Param("auctionId") String auctionId, @Param("excludeBidderId") String excludeBidderId);
}
