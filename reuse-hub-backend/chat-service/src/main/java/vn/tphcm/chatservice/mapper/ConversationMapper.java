/*
 * @ (#) ConversationMapper.java       1.0     10/11/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 10/11/2025
 */

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.chatservice.dtos.response.ConversationResponse;
import vn.tphcm.chatservice.models.Conversation;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    @Mapping(target = "otherParticipantId", ignore = true)
    @Mapping(target = "otherParticipantName", ignore = true)
    @Mapping(target = "otherParticipantAvatar", ignore = true)
    ConversationResponse toResponse(Conversation conversation);
}
