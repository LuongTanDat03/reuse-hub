/*
 * @ (#) MessageResponse.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.dtos;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime timestamp;
}
