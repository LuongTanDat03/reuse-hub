/*
 * @ (#) MessageConsumer.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */

import com.rabbitmq.client.Channel;
import event.dto.EventMessage;
import org.springframework.amqp.core.Message;

public interface MessageConsumer {
    void handleItemCreated(EventMessage event, Channel channel, Message message) throws Exception;
}
