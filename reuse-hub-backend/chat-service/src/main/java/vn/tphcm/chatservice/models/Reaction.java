/*
 * @ (#) Reaction.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

import lombok.*;
import vn.tphcm.chatservice.commons.ReactionType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {
    private String userId;
    private ReactionType type;
}
