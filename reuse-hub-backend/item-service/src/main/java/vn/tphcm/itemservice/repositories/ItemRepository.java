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

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    Page<Item> findByUserIdAndStatusNot(String userId, ItemStatus status, Pageable pageable);

    Page<Item> findByStatus(ItemStatus status, Pageable pageable);

    @Query("SELECT i FROM Item i " +
            "WHERE i.title LIKE (CONCAT('%', :keyword, '%') ) " +
            "AND i.status = 'AVAILABLE'")
    Page<Item> findByKeyword(@Param("keyword") String keyword,
                                      Pageable pageable);

    Page<Item> findByCategorySlugAndStatus(String categorySlug, ItemStatus status, Pageable pageable);

    @Query("SELECT i FROM Item i " +
            "WHERE i.status = :status " +
            "ORDER BY i.viewCount DESC")
    Page<Item> findPopularItemsByStatus(ItemStatus status, Pageable pageable);

    @Query(value = "SELECT * FROM tbl_items i " +
            "WHERE i.status = 'AVAILABLE' AND " +
            "ST_DWithin(" +
            "  i.location, " +
            "  ST_MakePoint(:longitude, :latitude)::geography, " +
            "  :radius " +
            ") " +
            "ORDER BY ST_Distance(i.location, ST_MakePoint(:longitude, :latitude)::geography)",
            nativeQuery = true)
    Page<Item> searchItemNearby(@Param("latitude") double latitude,
                                @Param("longitude") double longitude,
                                @Param("radius") double radius,
                                Pageable pageable);

    @Query("SELECT DISTINCT i FROM Item i " +
            "WHERE i.status = 'AVAILABLE' AND " +
            "EXISTS (SELECT t FROM i.tags t WHERE t IN :tags)")
    Page<Item> findByTagsInAndStatusAvailable(@Param("tags") List<String> tags,
                                              Pageable pageable);

    @Query("SELECT i FROM Item i " +
            "WHERE i.category.slug = :categorySlug" )
    Page<Item> findAllPageByCategory(@Param("categorySlug") String categorySlug, Pageable pageable);

     @Query("SELECT i.status, COUNT(i) FROM Item i GROUP BY i.status")
    List<Object[]> countItemsByStatus();
}
