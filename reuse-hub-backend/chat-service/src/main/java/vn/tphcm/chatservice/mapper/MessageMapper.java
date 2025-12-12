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
import vn.tphcm.chatservice.dtos.response.MessageResponse;
import vn.tphcm.chatservice.models.Message;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    @Mapping(target = "offerPrice", source = "offerPrice")
    @Mapping(target = "offerStatus", source = "offerStatus")
    @Mapping(target = "relatedOfferId", source = "relatedOfferId")
    @Mapping(target = "itemId", source = "itemId")
    @Mapping(target = "itemTitle", source = "itemTitle")
    @Mapping(target = "itemThumbnail", source = "itemThumbnail")
    @Mapping(target = "originalPrice", source = "originalPrice")
    MessageResponse toResponse(Message message);
}
