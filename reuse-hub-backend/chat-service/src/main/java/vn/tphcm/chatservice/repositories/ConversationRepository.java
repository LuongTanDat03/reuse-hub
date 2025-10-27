/*
 * @ (#) ConversationRepository.java       1.0     10/5/2025
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
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import vn.tphcm.chatservice.models.Conversation;

import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query("{ $or:  [{ 'userFirstId': ?0, 'userSecondId': ?1 }, { 'userFirstId': ?1, 'userSecondId': ?0 }  ]}")
    Optional<Conversation> findByTwoUsers(String userFirstId, String userSecondId);

    @Query("{ $or:  [{'user1Id':  ?0}, {'user2Id':  ?0} ], 'status':  {$ne: ['DELETED','HIDE']} }")
    Page<Conversation> findConversationsOfUser(String userId, Pageable pageable);

    @Query("{ '_id': ?0, $or:  [{'user1Id':  ?1}, {'user2Id':  ?1} ] }")
    Optional<Conversation> findByIdAndUserId(String conversationId, String userId);

    Optional<Conversation> findByParticipantsKey(String participantsKey);
}
