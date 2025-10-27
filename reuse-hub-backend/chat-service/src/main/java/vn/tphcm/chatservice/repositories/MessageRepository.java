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
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import vn.tphcm.chatservice.models.Message;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    @Query("{ 'conversationId': ?0, " +
            "$or:  [" +
            "{ 'senderId': ?1, 'deletedBySender': false }, " +
            "{ 'receiverId': ?1, 'deletedByReceiver': false } " +
            "] }")
    Page<Message> findConversationMessages(String conversationId, String userId, int page, int size);

    @Query(value = "{ 'conversationId': ?0 }", sort = "{ 'createdAt': -1 }")
    Optional<Message> findLastMessage(String conversationId);
}
