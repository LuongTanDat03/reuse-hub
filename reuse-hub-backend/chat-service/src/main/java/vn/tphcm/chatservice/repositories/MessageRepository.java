/*
 * @ (#) MessageRepository.java       1.0     10/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 10/5/2025
 */

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.chatservice.models.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByConversationId(String conversationId, Pageable pageable);
}
