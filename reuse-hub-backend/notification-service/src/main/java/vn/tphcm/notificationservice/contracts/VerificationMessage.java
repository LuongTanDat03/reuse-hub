/*
 * @ (#) VerificationMessage.java       1.0     8/17/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.contracts;
/*
 * @author: Luong Tan Dat
 * @date: 8/17/2025
 */


import java.util.UUID;


public record VerificationMessage(
        String messageId,
        String email,
        Long userId,
        String verificationCode
) {
    public static VerificationMessage of(String email, Long userId, String verificationCode) {
        return new VerificationMessage(UUID.randomUUID().toString(), email, userId, verificationCode);
    }
}
