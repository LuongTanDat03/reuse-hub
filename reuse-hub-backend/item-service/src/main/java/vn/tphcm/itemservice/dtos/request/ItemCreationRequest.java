/*
 * @ (#) ItemCreationRequest.java       1.0     9/19/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 9/19/2025
 */

import lombok.Getter;

import java.util.List;

@Getter
public class ItemCreationRequest {
    private String title;

    private String description;

    private List<String> tags;

    private String category;

    private Long price;

    private LocationRequest locationRequest;
}
