/*
 * @ (#) InvalidDataException.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.exceptions;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

public class InvalidDataException extends RuntimeException {
    public InvalidDataException(String message) {
        super(message);
    }
}
