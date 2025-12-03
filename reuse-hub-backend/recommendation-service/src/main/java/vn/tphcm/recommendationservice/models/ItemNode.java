/*
 * @ (#) ItemNoe.java       1.0     11/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 11/12/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import java.util.List;

@Node("Item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemNode {
    @Id
    private String itemId;

    private String category;

    private List<String> tags;
}
