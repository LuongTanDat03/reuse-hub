/*
 * @ (#) ItemRepository.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.repositories;
/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.commons.ItemStatus;
import vn.tphcm.itemservice.models.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    Page<Item> findByUserIdAndStatusNot(String userId, ItemStatus status, Pageable pageable);

    Page<Item> findByStatus(ItemStatus status, Pageable pageable);

    @Query("SELECT i FROM Item i " +
            "WHERE (LOWER(i.title) LIKE (CONCAT('%', :keyword, '%') ) ) " +
            "AND i.status = :status")
    Page<Item> findByKeywordAndStatus(@Param("keyword") String keyword,
                                      @Param("status") ItemStatus status,
                                      Pageable pageable);

    Page<Item> findByCategoryAndStatus(String category, ItemStatus status, Pageable pageable);

    @Query("SELECT i FROM Item i " +
            "WHERE i.status = :status " +
            "ORDER BY i.viewCount DESC")
    Page<Item> findPopularItemsByStatus(ItemStatus status, Pageable pageable);


}
