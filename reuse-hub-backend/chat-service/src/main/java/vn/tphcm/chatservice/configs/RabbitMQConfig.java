/*
 * @ (#) RabbitMQConfig.java       1.0     10/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.chatservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/12/2025
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j(topic = "RABBITMQ-CONFIG")
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.chat}")
    private String chatExchange;

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-keys.message}")
    private String messageRoutingKey;

    @Value("${rabbitmq.routing-keys.notification}")
    private String notificationRoutingKey;

    @Bean
    public TopicExchange chatExchange() {
        log.info("Creating Chat Topic Exchange: {}", chatExchange);
        return new TopicExchange(chatExchange, true, false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        log.info("Creating Notification Topic Exchange: {}", notificationExchange);
        return new TopicExchange(notificationExchange, true, false);
    }




    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        log.info("Initializing Jackson2JsonMessageConverter for RabbitMQ");

        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        log.info("Initializing RabbitTemplate with custom Message Converter");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(factory);

        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());

        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }
}

