/*
 * @ (#) AbstractEntity.java       1.0     8/23/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/23/2025
 */

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import java.time.LocalDateTime;

@Getter
@Setter
public abstract class AbstractEntity {
    @Id
    @GeneratedValue(generatorClass = UUIDStringGenerator.class)
    private String id;

    @CreatedDate
    @Property("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Property("updated_at")
    private LocalDateTime updatedAt;

}
