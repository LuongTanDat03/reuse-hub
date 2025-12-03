/*
 * @ (#) ItemInteraction.java       1.0     9/19/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 9/19/2025
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.commons.InteractionType;
import vn.tphcm.itemservice.models.Item;
import vn.tphcm.itemservice.models.ItemInteraction;

import java.util.Optional;

@Repository
public interface ItemInteractionRepository extends JpaRepository<ItemInteraction, String> {
    Optional<ItemInteraction> findByItemAndUserIdAndInteractionType(Item item, String userId, InteractionType interactionType);
}
