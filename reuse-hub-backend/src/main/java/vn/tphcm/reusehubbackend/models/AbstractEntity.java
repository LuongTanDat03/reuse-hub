/*
 * @ (#) AbstractEntity.java       1.0     8/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/12/2025
 */

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public abstract class AbstractEntity<T> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private T id;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @CreationTimestamp
    private LocalDateTime updatedAt;
}
