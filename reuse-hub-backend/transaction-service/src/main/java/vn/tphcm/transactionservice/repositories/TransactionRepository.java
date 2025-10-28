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

    @Query("SELECT t FROM Transaction t WHERE t.buyerId = :buyerId ORDER BY t.createdAt DESC")
    Page<Transaction> findByBuyerId(@Param("buyerId") String buyerId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.sellerId = :sellerId ORDER BY t.createdAt DESC")
    Page<Transaction> findBySellerId(@Param("sellerId") String sellerId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.buyerId = :userId OR t.sellerId = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status ORDER BY t.createdAt DESC")
    Page<Transaction> findByStatus(@Param("status") TransactionStatus status, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.type = :type ORDER BY t.createdAt DESC")
    Page<Transaction> findByType(@Param("type") TransactionType type, Pageable pageable);

    @Query ("SELECT t FROM Transaction t WHERE t.itemId = :itemId ORDER BY t.createdAt DESC")
    Page<Transaction> findByItemId(@Param("itemId") String itemId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.status = 'PENDING' AND t.sellerId = :sellerId ORDER BY t.createdAt DESC")
    Page<Transaction> findPendingForSeller(@Param("sellerId") String sellerId, Pageable pageable);

    /**
     * Find expired transactions with given statuses before a specific time
     * @param statues
     * @param expireAt
     * @return
     */
    List<Transaction> findByStatusInAndExpiresAtBefore(@Param("statues") List<TransactionStatus> statues,@Param("now") LocalDateTime expireAt);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status AND (t.buyerId = :userId OR t.sellerId = :userId) ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserIdAndStatus(@Param("status") TransactionStatus status, @Param("userId") String userId, Pageable pageable);

    @Query("SELECT COUNT(t) > 0 FROM Transaction t " +
            "WHERE t.itemId = :itemId " +
            "AND t.buyerId = :buyerId " +
            "AND t.status IN ('PENDING', 'RESERVED')")
    boolean hasActiveTransactionForItem(@Param("itemId") String itemId, @Param("userId") String userId);


}
