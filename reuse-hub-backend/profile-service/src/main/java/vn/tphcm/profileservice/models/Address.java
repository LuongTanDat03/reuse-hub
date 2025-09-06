/*
 * @ (#) Address.java       1.0     8/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/12/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Node("tbl_address")
public class Address extends AbstractEntity {
    @Property("address_line")
    private String addressLine;

    private String ward;

    private String district;

    private String city;

    private String country;

    @Relationship(type = "HAS_ADDRESS", direction = Relationship.Direction.INCOMING)
    private User user;
}
