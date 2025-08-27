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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import vn.tphcm.itemservice.commons.ItemStatus;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_item")
public class Item extends AbstractEntity<Long> implements Serializable {
    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String title;

    private String description;

    @Column(columnDefinition = "jsonb")
    private String images;

    @Column(columnDefinition = "jsonb")
    private String tags;

    private String category;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ItemStatus status;

    @Column(name = "view_counts")
    private int viewCounts;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemInteraction> itemInteractions = new ArrayList<>();
}
