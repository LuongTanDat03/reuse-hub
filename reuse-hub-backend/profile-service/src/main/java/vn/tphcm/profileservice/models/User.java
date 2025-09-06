/*
 * @ (#) User.java       1.0     8/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/31/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import vn.tphcm.profileservice.commons.Gender;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Node("tbl_user_profile")
public class User extends AbstractEntity implements Serializable {
    @Property("user_id")
    private String userId;

    @Property("first_name")
    private String firstName;

    @Property("last_name")
    private String lastName;

    private Gender gender;

    private LocalDate birthday;

    private String phone;

    private String email;

    @Property("avatar")
    private String avatarUrl;

    @Property("rating_average")
    private double ratingAverage;

    @Property("rating_count")
    private int ratingCount;

    private Point location;

    private String preferences;

    @Relationship(type = "HAS_ADDRESS", direction = Relationship.Direction.OUTGOING)
    private List<Address> address;

    @Relationship(type = "HAS_HISTORY", direction = Relationship.Direction.OUTGOING)
    private List<UserHistory> histories = new ArrayList<>();
}
