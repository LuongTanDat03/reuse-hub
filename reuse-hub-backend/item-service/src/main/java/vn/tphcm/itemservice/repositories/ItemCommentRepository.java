/*
 * @ (#) ItemCommentRepository.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.models.ItemComment;

/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

@Repository
public interface ItemCommentRepository extends JpaRepository<ItemComment, String> {
    Page<ItemComment> findByItemId(String itemId, Pageable pageable);

    long countByItemId(String itemId);
}
