/*
 * @ (#) UserRepositoty.java       1.0     9/1/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 9/1/2025
 */

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.profileservice.models.User;

@Repository
public interface UserRepository extends Neo4jRepository<User, String> {
}
