/*
 * @ (#) MessageConsumer.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import org.springframework.amqp.core.Message;
import org.springframework.stereotype.Service;

@Service
public interface MessageConsumer {
    void notifyVerificationEmail(String email, Message message);
}
