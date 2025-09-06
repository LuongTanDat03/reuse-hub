/*
 * @ (#) UserHistory.java       1.0     8/23/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/23/2025
 */

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import vn.tphcm.profileservice.commons.ActionType;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Node("tbl_user_history")
public class UserHistory extends AbstractEntity implements Serializable {
    @Relationship(type = "HAS_HISTORY", direction = Relationship.Direction.INCOMING)
    private User user;

    @Property("action_type")
    private ActionType actionType;

    @Property("item_id")
    private String itemId;

}
