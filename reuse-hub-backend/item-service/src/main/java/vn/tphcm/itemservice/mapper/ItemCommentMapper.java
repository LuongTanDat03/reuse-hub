/*
 * @ (#) ItemCommentMapper.java       1.0     11/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 11/2/2025
 */

import org.mapstruct.Mapper;
import vn.tphcm.itemservice.dtos.response.CommentResponse;
import vn.tphcm.itemservice.models.ItemComment;

@Mapper(componentModel = "spring")
public interface ItemCommentMapper {
    CommentResponse toCommentResponse(ItemComment itemComment);
}
