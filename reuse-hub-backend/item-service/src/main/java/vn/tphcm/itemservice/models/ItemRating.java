/*
 * @ (#) Rating.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tbl_ratings")
@Table
@Builder
public class ItemRating extends AbstractEntity<String> implements Serializable {
    private String userId;
    private Double rating;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    private Item item;
}
