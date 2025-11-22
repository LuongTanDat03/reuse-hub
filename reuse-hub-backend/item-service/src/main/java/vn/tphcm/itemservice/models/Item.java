/*
 * @ (#) Item.java       1.0     8/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/21/2025
 */

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import vn.tphcm.itemservice.commons.ItemStatus;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_items", indexes = {
        @Index(name = "idx_items_user_id", columnList = "userId")
})
@Builder
public class Item extends AbstractEntity<String> implements Serializable {
    @Column(name = "user_id", nullable = false)
    private String userId;

    private String title;

    private String description;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tbl_item_tags", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "tag_name")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(columnDefinition = "geometry(Point, 4326)")
    @JdbcTypeCode(SqlTypes.GEOMETRY)
    private Point location;

    private String address;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0", name = "view_count")
    @Builder.Default
    private int viewCount = 0;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0", name = "comment_count")
    @Builder.Default
    private int commentCount = 0;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0", name = "like_count")
    @Builder.Default
    private int likeCount = 0;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.0")
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0", name = "rating_count")
    @Builder.Default
    private Integer ratingCount = 0;

    private Long price;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private boolean isPremium = false;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<ItemComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<ItemRating> ratings = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<ItemInteraction> itemInteractions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
