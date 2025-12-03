/*
 * @ (#) RabbitMQConfig.java       1.0     8/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.notificationservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 8/16/2025
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j(topic = "RABBITMQ-CONFIG")
public class RabbitMQConfig {
    public static final String EXCHANGE_NOTIFICATION = "ex.notification";
    public static final String RK_NOTIFICATION_ITEM = "rk.notification.item";
    public static final String Q_NOTIFICATION = "q.notification";
    public static final String Q_NOTIFICATION_DLX = "q.notification.dlx";
    public static final String EXCHANGE_NOTIFICATION_DLX = "ex.notification.dlx";

    public static final String EXCHANGE_VERIFICATION = "ex.verification";
    public static final String RK_VERIFICATION_ITEM = "rk.verification.item";
    public static final String Q_VERIFICATION = "q.verification";
    public static final String Q_VERIFICATION_DLX = "q.verification.dlx";
    public static final String EXCHANGE_VERIFICATION_DLX = "ex.verification.dlx";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(EXCHANGE_NOTIFICATION, true, false);
    }

    // This Exchange is used for dead-lettering exchanges
    @Bean
    public TopicExchange notificationDlx() {
        return new TopicExchange(EXCHANGE_NOTIFICATION_DLX, true, false);
    }

    // This Queue is used for dead-lettering exchanges
    @Bean
    public Queue notificationDlq() {
        return QueueBuilder.durable(Q_NOTIFICATION_DLX).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(Q_NOTIFICATION)
                .withArgument("x-dead-letter-exchange", EXCHANGE_NOTIFICATION_DLX)
                .withArgument("x-dead-letter-routing-key", Q_NOTIFICATION_DLX)
                .build();
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder.bind(notificationQueue()).to(notificationExchange()).with(RK_NOTIFICATION_ITEM);
    }

    @Bean
    public Binding notificationBindingDlq() {
        return BindingBuilder.bind(notificationDlq()).to(notificationDlx()).with(Q_NOTIFICATION_DLX);
    }

    @Bean
    public TopicExchange verificationExchange() {
        return new TopicExchange(EXCHANGE_VERIFICATION, true, false);
    }

    @Bean
    public TopicExchange verificationDlx() {
        return new TopicExchange(EXCHANGE_VERIFICATION_DLX, true, false);
    }

    @Bean
    public Queue verificationDlq() {
        return QueueBuilder.durable(Q_VERIFICATION_DLX).build();
    }

    @Bean
    public Queue verificationQueue() {
        return QueueBuilder.durable(Q_VERIFICATION)
                .withArgument("x-dead-letter-exchange", EXCHANGE_VERIFICATION_DLX)
                .withArgument("x-dead-letter-routing-key", Q_VERIFICATION_DLX)
                .build();
    }

    @Bean
    public Binding verificationBinding() {
        return BindingBuilder.bind(verificationQueue()).to(verificationExchange()).with(RK_VERIFICATION_ITEM);
    }

    @Bean
    public Binding verificationBindingDlq() {
        return BindingBuilder.bind(verificationDlq()).to(verificationDlx()).with(Q_VERIFICATION_DLX);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        log.info("Initializing RabbitTemplate with provided ConnectionFactory");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());

        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        log.info("Initializing Jackson2JsonMessageConverter");

        return new Jackson2JsonMessageConverter();
    }

}
