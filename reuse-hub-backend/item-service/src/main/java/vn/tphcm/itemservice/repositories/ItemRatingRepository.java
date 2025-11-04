/*
 * @ (#) ItemRatingRepository.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.models.ItemRating;

import java.util.Optional;

@Repository
public interface ItemRatingRepository extends JpaRepository<ItemRating, String> {

    Optional<ItemRating> findByItemIdAndUserId(String itemId, String userId);

    @Query("SELECT AVG(r.rating) FROM tbl_ratings r WHERE r.item.id = :itemId")
    Double calculateAverageRating(@Param("itemId") String itemId);

    @Query("SELECT COUNT(r) FROM tbl_ratings r WHERE r.item.id = :itemId")
    Integer countRatingsByItemId(@Param("itemId") String itemId);
}
