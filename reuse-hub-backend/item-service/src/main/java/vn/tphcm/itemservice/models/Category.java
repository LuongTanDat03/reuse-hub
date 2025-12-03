/*
 * @ (#) Category.java       1.0     11/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 11/17/2025
 */

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_category", indexes = {
        @Index(name = "idx_category_name", columnList = "name")
})
@Builder
public class Category extends AbstractEntity<String> implements Serializable {
    private String name;

    private String slug;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<Item> item = new ArrayList<>();
}
