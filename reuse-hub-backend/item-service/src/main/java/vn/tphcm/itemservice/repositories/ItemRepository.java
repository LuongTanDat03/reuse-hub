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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.models.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
}
