/*
 * @ (#) SubmitRatingRequest.java       1.0     10/27/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.dtos.request;
/*
 * @author: Luong Tan Dat
 * @date: 10/27/2025
 */

import lombok.Getter;

@Getter
public class SubmitRatingRequest {
    private String itemId;
    private Double rating;
    private String comment;
}
