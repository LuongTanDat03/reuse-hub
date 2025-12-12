package vn.tphcm.auctionservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.auctionservice.commons.AuctionStatus;
import vn.tphcm.auctionservice.models.Auction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, String> {

    Page<Auction> findByStatus(AuctionStatus status, Pageable pageable);

    Page<Auction> findBySellerId(String sellerId, Pageable pageable);

    Page<Auction> findByCategoryId(String categoryId, Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status = :status AND a.endTime <= :now")
    List<Auction> findEndedAuctions(@Param("status") AuctionStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Auction a WHERE a.status = :status AND a.startTime <= :now")
    List<Auction> findAuctionsToStart(@Param("status") AuctionStatus status, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.endTime ASC")
    Page<Auction> findActiveAuctionsEndingSoon(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' ORDER BY a.bidCount DESC")
    Page<Auction> findHotAuctions(Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.title LIKE %:keyword% OR a.description LIKE %:keyword%")
    Page<Auction> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Optional<Auction> findByItemId(String itemId);

    @Query("SELECT DISTINCT a FROM Auction a JOIN a.bids b WHERE b.bidderId = :userId")
    Page<Auction> findAuctionsUserBidOn(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE a.winnerId = :userId")
    Page<Auction> findWonAuctions(@Param("userId") String userId, Pageable pageable);
}
