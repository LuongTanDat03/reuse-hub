/*
 * @ (#) EmailServiceImpl.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import com.rabbitmq.client.Channel;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.tphcm.notificationservice.configs.RabbitMQConfig;
import vn.tphcm.notificationservice.contracts.VerificationMessage;
import vn.tphcm.notificationservice.services.EmailService;

import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "EMAIL-SERVICE")
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    @RabbitListener(queues = RabbitMQConfig.Q_VERIFICATION)
    public void sendVerificationEmail(VerificationMessage message, Message amqpMessage, Channel chanel) throws Exception {
        log.info("Received verification email message: {}", message);

        long tag = amqpMessage.getMessageProperties().getDeliveryTag();
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            Context context = new Context();

            Map<String, Object> properties = new HashMap<>();
            properties.put("verificationCode", message.verificationCode());
            context.setVariables(properties);

            helper.setTo(message.email());
            helper.setSubject("Please confirm your account");
            String html = templateEngine.process("send-email.html", context);
            helper.setText(html, true);

            mailSender.send(mimeMessage);

            chanel.basicAck(tag, false);
            log.info("Link has sent to user, email={}, code={}", message.email(), message.verificationCode());

        } catch (MessagingException e) {
            chanel.basicReject(tag, false); // No requeue => Don't retry sending the message before restarting the service
            log.error("Error sending email to user, error={}", e.getMessage());
            throw e;
        }
    }
}
