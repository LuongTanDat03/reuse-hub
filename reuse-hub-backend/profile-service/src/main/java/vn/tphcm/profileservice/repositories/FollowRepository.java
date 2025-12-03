/*
 * @ (#) FollowRepository.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.profileservice.models.Follow;

import java.util.Optional;

/*
 * @author: AI Assistant
 * @date: 11/30/2025
 */

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {
    
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    
    Page<Follow> findByFollowerId(String followerId, Pageable pageable);
    
    Page<Follow> findByFollowingId(String followingId, Pageable pageable);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId")
    long countFollowers(@Param("userId") String userId);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followerId = :userId")
    long countFollowing(@Param("userId") String userId);
    
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
