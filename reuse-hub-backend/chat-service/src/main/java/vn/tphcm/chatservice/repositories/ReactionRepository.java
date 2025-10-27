/*
 * @ (#) ReactionRepository.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.chatservice.models.Reaction;

/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

@Repository
public interface ReactionRepository extends MongoRepository<Reaction, String> {
}
