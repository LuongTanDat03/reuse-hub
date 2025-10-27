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
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
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

    @Value("${rabbitmq.queues.message}")
    private String messageQueue;

    @Value("${rabbitmq.queues.presence}")
    private String presenceQueue;

    @Value("${rabbitmq.queues.typing}")
    private String typingQueue;

    @Value("${rabbitmq.routing-keys.message}")
    private String messageRoutingKey;

    @Value("${rabbitmq.routing-keys.presence}")
    private String presenceRoutingKey;

    @Value("${rabbitmq.routing-keys.typing}")
    private String typingRoutingKey;

    @Bean
    public TopicExchange chatExchange() {
        log.info("Creating Topic Exchange: {}", chatExchange);
        return new TopicExchange(chatExchange, true, false);
    }

    @Bean
    public Queue messageQueue() {
        log.info("Creating Message Queue: {}", messageQueue);
        return new Queue(messageQueue, true);
    }

    @Bean
    public Binding messageBinding() {
        log.info("Binding Queue {} to Exchange {} with Routing Key {}", messageQueue, chatExchange, messageRoutingKey);

        return BindingBuilder
                .bind(messageQueue())
                .to(chatExchange())
                .with(messageRoutingKey);
    }

    @Bean
    public Queue presenceQueue() {
        log.info("Creating Presence Queue: {}", presenceQueue);
        return new Queue(presenceQueue, true);
    }

    @Bean
    public Binding presenceBinding() {
        log.info("Binding Presence Queue {} to Exchange {} with Routing Key {}", presenceQueue, chatExchange, presenceRoutingKey);

        return BindingBuilder
                .bind(presenceQueue())
                .to(chatExchange())
                .with(presenceRoutingKey);
    }

    @Bean
    public Queue typingQueue() {
        log.info("Creating Typing Queue: {}", typingQueue);
        return new Queue(typingQueue, true);
    }

    @Bean
    public Binding typingBinding() {
        log.info("Binding Typing Queue {} to Exchange {} with Routing Key {}", typingQueue, chatExchange, typingRoutingKey);

        return BindingBuilder
                .bind(typingQueue())
                .to(chatExchange())
                .with(typingRoutingKey);
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

