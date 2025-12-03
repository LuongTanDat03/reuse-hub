/*
 * @ (#) ResourceNotFoundException.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.exceptions;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
