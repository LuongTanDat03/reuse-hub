/*
 * @ (#) TransactionRepository.java       1.0     10/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 10/22/2025
 */

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.transactionservice.commons.TransactionStatus;
import vn.tphcm.transactionservice.commons.TransactionType;
import vn.tphcm.transactionservice.models.Transaction;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    Page<Transaction> findByBuyerIdOrderByCreatedAtDesc(String buyerId, Pageable pageable);

    Page<Transaction> findBySellerIdOrderByCreatedAtDesc(String sellerId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.buyerId = :userId OR t.sellerId = :userId) AND t.status = :status ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") String userId, @Param("status") TransactionStatus status, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.buyerId = :userId OR t.sellerId = :userId) AND t.status = :status ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(@Param("userId") String userId, @Param("status") TransactionType type, Pageable pageable);

    List<Transaction> findByStatusInAndExpiresAtBefore(List<TransactionStatus> statuses, LocalDateTime expiresAt);

    @Query("SELECT t FROM Transaction t WHERE t.buyerId = :userId OR t.sellerId = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.status = 'PENDING' AND t.sellerId = :sellerId ORDER BY t.createdAt DESC")
    Page<Transaction> findPendingForSeller(@Param("sellerId") String sellerId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.status = 'PENDING' AND t.expiresAt <= :now")
    List<Transaction> findExpiredPendingTransactions(@Param("now") LocalDateTime now);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status AND (t.buyerId = :userId OR t.sellerId = :userId) ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") TransactionStatus status, Pageable pageable);

    @Query("SELECT COUNT(t) > 0 FROM Transaction t " +
            "WHERE t.itemId = :itemId " +
            "AND t.buyerId = :buyerId " +
            "AND t.status = 'PENDING'")
    boolean hasActiveTransactionForItem(@Param("itemId") String itemId, @Param("userId") String userId);

    @Query("SELECT t FROM Transaction t")
    Page<Transaction> findAllPage(Pageable pageable);

    @Query("SELECT t.status, COUNT(t) FROM Transaction t GROUP BY t.status")
    List<Object[]> countTransactionsByStatus();
}
