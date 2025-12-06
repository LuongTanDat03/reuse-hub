/*
 * @ (#) CategoryRepository.java       1.0     11/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.repositories;
/*
 * @author: Luong Tan Dat
 * @date: 11/17/2025
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.tphcm.itemservice.dtos.response.CategoryResponse;
import vn.tphcm.itemservice.models.Category;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    @Query("SELECT new vn.tphcm.itemservice.dtos.response.CategoryResponse(c.id, c.name, c.slug) FROM Category c")
    List<CategoryResponse> findAllCategoriesSimple();
}
