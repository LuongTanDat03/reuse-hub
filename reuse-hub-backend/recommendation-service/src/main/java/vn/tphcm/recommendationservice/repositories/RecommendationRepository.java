/*
 * @ (#) RecommendationRepository.java       1.0     11/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.repositories;
/*
 * @author: Luong Tan Dat
 * @date: 11/17/2025
 */

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.recommendationservice.models.ItemNode;

import java.util.List;

@Repository
public interface RecommendationRepository extends Neo4jRepository<ItemNode, String> {
    @Query("MERGE (u:User {userId: $userId})")
    void saveUser(@Param("userId") String userId);

    @Query("MERGE (i:Item {itemId: $itemId}) " +
            "SET i.category = $category, i.tags = $tags")
    void saveItem(@Param("itemId") String itemId,
                  @Param("category") String category,
                  @Param("tags") List<String> tags);

    @Query("MATCH (u:User {userId: $userId}), (i:Item {itemId: $itemId}) " +
            "MERGE (u)-[r:INTERACTED {type: $type}]->(i) " +
            "ON CREATE SET r.weight = $weight, r.timestamp = datetime() " +
            "ON MATCH SET r.weight = r.weight + $weight, r.timestamp = datetime()")
    void saveInteraction(@Param("userId") String userId,
                         @Param("itemId") String itemId,
                         @Param("type") String type,
                         @Param("weight") int weight);

    @Query("CALL { " +
           "  MATCH (u:User {userId: $userId})-[r:INTERACTED]->(i:Item) " +
           "  MATCH (rec:Item) WHERE rec.itemId <> i.itemId " +
           "  AND (rec.category = i.category OR any(t IN rec.tags WHERE t IN i.tags)) " +
           "  RETURN rec, count(*) * 2 AS score " +
           "UNION ALL " +
           "  MATCH (u:User {userId: $userId})-[:INTERACTED]->(:Item)<-[:INTERACTED]-(other:User)-[r2:INTERACTED]->(rec:Item) " +
           "  WHERE NOT (u)-[:INTERACTED]->(rec) " +
           "  RETURN rec, sum(r2.weight) * 5 AS score " +
           "} " +
           "WITH rec, sum(score) AS totalScore " +
           "RETURN rec " +
           "ORDER BY totalScore DESC " +
           "LIMIT $limit")
    List<ItemNode> getHybridRecommendations(@Param("userId") String userId, @Param("limit") int limit);
}
