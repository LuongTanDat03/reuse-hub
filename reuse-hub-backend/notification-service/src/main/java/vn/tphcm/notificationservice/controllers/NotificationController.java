/*
 * @ (#) EmailController.java       1.0     9/9/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.controllers;
/*
 * @author: Luong Tan Dat
 * @date: 9/9/2025
 */

import com.rabbitmq.client.Channel;
import event.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import vn.tphcm.notificationservice.configs.RabbitMQConfig;
import vn.tphcm.notificationservice.services.EmailService;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "EMAIL-CONTROLLER")
public class NotificationController {
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.Q_VERIFICATION)
    public void listenVerificationEmailQueue(NotificationEvent event, Message message, Channel channel) throws Exception {
        emailService.sendVerificationEmail(
                event,
                message,
                channel
        );
    }
}
