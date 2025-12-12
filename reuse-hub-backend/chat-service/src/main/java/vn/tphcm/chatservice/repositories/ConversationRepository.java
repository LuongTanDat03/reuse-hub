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

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query(value = "{ 'participantIds': { $all: [?0, ?1] } }", sort = "{ 'createdAt': -1 }")
    List<Conversation> findByParticipantIds(String userFirstId, String userSecondId);

    // Find conversation by participants AND itemId (for product-specific chat)
    @Query(value = "{ 'participantIds': { $all: [?0, ?1] }, 'itemId': ?2 }")
    Optional<Conversation> findByParticipantIdsAndItemId(String userFirstId, String userSecondId, String itemId);

    // Find conversation by participants without item (general chat)
    @Query(value = "{ 'participantIds': { $all: [?0, ?1] }, 'itemId': { $exists: false } }")
    Optional<Conversation> findByParticipantIdsWithoutItem(String userFirstId, String userSecondId);

    // Find conversation by participants with null itemId
    @Query(value = "{ 'participantIds': { $all: [?0, ?1] }, 'itemId': null }")
    Optional<Conversation> findByParticipantIdsWithNullItem(String userFirstId, String userSecondId);

    Page<Conversation> findByParticipantIdsContains(String userId, Pageable pageable);

    // Find by conversation id
    Optional<Conversation> findById(String id);
}
