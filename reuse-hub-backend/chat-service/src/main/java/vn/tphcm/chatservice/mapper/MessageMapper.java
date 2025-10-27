/*
 * @ (#) MessageMapper.java       1.0     10/8/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.mapper;
/*
 * @author: Luong Tan Dat
 * @date: 10/8/2025
 */

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.chatservice.dtos.request.SendMessageRequest;
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.models.Message;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageResponse toResponse(Message message);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contentBeforeEditOrDelete", ignore = true)
    Message toMessage(SendMessageRequest request);

}
