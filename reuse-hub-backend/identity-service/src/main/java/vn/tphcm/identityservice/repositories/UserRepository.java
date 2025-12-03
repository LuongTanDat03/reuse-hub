/*
 * @ (#) UserRepository.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.tphcm.identityservice.models.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsernameOrEmail(String username, String email);

    User findByUsername(String username);

    boolean existsByUsername(@NotBlank String username);

    boolean existsByEmail(@Email @NotBlank String email);

    @Query("SELECT u FROM User u")
    Page<User> findAllPage(Pageable pageable);

    @Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
    List<Object[]> countUsersByStatus();
}
