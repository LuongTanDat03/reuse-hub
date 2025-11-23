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
import event.dto.NotificationEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.tphcm.notificationservice.services.EmailService;

import java.io.IOException;


@Service
@RequiredArgsConstructor
@Slf4j(topic = "EMAIL-SERVICE")
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Override
    public void sendVerificationEmail(NotificationEvent event, Message amqpMessage, Channel chanel) {
        try {
            log.info("Received verification email message: {}", event);

            long tag = amqpMessage.getMessageProperties().getDeliveryTag();

            processAndSendEmail(event, chanel, tag);
        } catch (Exception e) {
            log.error("Failed to process verification email message: {}, error={}", event, e.getMessage());
        }
    }

    private void processAndSendEmail(NotificationEvent event, Channel channel, long tag) throws MessagingException, IOException {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            Context context = new Context();

            context.setVariables(event.getParam());

            helper.setTo(event.getRecipient());
            helper.setSubject(event.getSubject() != null ? event.getSubject() : "Please confirm your account");

            String templateName = event.getTemplateCode() != null ? event.getTemplateCode() : "send-email.html";
            String html = templateEngine.process(templateName, context);
            helper.setText(html, true);

            mailSender.send(mimeMessage);

            channel.basicAck(tag, false);
            log.info("Link has sent to user, email={}, param={}", event.getRecipient(), event.getParam());

        } catch (MessagingException e) {
            channel.basicReject(tag, false); // No requeue => Don't retry sending the message before restarting the service
            log.error("Error sending email to user, error={}", e.getMessage());
            throw e;
        }
    }
}
