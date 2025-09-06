/*
 * @ (#) MessageProducerImpl.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.tphcm.identityservice.configs.RabbitMQConfig;
import vn.tphcm.event.dto.VerificationMessage;
import vn.tphcm.identityservice.services.MessageProducer;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-PRODUCER")
public class MessageProducerImpl implements MessageProducer {
    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishVerificationEmail(VerificationMessage verificationMessage) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_VERIFICATION,
                RabbitMQConfig.RK_VERIFICATION_ITEM,
                verificationMessage,
                message -> {
                    message.getMessageProperties().setMessageId(verificationMessage.messageId());
                    message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                    return message;
                }
        );

        log.info("Sent verification email message: {}", verificationMessage.messageId());
    }
}
