/*
 * @ (#) MessageConsumer.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import vn.tphcm.event.dto.AiTagsGeneratedEvent;
import vn.tphcm.event.dto.FeedbackEvent;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.event.dto.TransactionEventMessage;

public interface MessageConsumer {
    void handleTransactionEvent(TransactionEventMessage event, Channel channel, Message message) throws Exception;

    void handleFeedbackSubmitted(FeedbackEvent event, Channel channel, Message message) throws Exception;

    void handlePaymentEvent(PaymentEvent event, Channel channel, Message message) throws Exception;

    void handleAiTagsGenerated(AiTagsGeneratedEvent event, Channel channel, Message message) throws Exception;
}
