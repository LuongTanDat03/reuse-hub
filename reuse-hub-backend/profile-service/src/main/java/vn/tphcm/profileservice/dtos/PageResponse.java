/*
 * @ (#) PageResponse.java       1.0     11/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.dtos;
/*
 * @author: Luong Tan Dat
 * @date: 11/5/2025
 */

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T>{
    private List<T> content;

    private int pageNo;

    private int pageSize;

    private long totalElements;

    private int totalPages;

    private boolean last;
}
