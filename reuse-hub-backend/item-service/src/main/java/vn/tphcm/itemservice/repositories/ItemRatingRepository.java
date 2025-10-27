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
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.models.ItemRating;

@Repository
public interface ItemRatingRepository extends JpaRepository<ItemRating, String> {
}
