/*
 * @ (#) EmailService.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import com.rabbitmq.client.Channel;
import event.dto.NotificationEvent;
import org.springframework.amqp.core.Message;
import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void sendVerificationEmail(NotificationEvent event, Message amqpMessage, Channel channel) throws Exception;
}
