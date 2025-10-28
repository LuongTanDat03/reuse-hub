/*
 * @ (#) UserHasRoleRepository.java       1.0     9/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 9/13/2025
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.identityservice.models.UserHasRole;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface UserHasRoleRepository extends JpaRepository<UserHasRole, String> {
    Optional<UserHasRole> findByUser_Id(String userId);
}
