/*
 * @ (#) AiTagsGeneratedEvent.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.event.dto;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiTagsGeneratedEvent {
    private String itemId;
    private List<String> tags;
}
