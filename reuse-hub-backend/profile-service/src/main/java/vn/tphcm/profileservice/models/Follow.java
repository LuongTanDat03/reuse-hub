/*
 * @ (#) Follow.java       1.0     11/30/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

/*
 * @author: AI Assistant
 * @date: 11/30/2025
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_follows", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"}),
    indexes = {
        @Index(name = "idx_follow_follower", columnList = "follower_id"),
        @Index(name = "idx_follow_following", columnList = "following_id")
    })
@EntityListeners(AuditingEntityListener.class)
public class Follow extends AbstractEntity<String> implements Serializable {
    @Column(name = "follower_id", nullable = false)
    private String followerId;
    
    @Column(name = "following_id", nullable = false)
    private String followingId;

}
