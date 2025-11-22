/*
 * @ (#) MessageConsumer.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.services;

import com.rabbitmq.client.Channel;
import event.dto.NotificationMessage;
import org.springframework.amqp.core.Message;

/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */
public interface MessageConsumer {
    void consumeNotification(NotificationMessage message, Message amqpMessage, Channel channel);
}
