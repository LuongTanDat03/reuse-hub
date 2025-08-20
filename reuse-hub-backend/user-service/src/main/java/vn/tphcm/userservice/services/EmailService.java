/*
 * @ (#) EmailService.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.userservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.stereotype.Service;
import vn.tphcm.userservice.contracts.VerificationMessage;

@Service
public interface EmailService {
    void sendVerificationEmail(VerificationMessage message, Message amqpMessage, Channel channel) throws Exception;
}
