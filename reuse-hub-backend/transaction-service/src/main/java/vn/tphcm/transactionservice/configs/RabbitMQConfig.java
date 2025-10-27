/*
 * @ (#) RabbitMQConfig.java       1.0     10/23/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/23/2025
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j(topic = "RABBIT-MQ-CONFIG")
public class RabbitMQConfig {
    @Value("${rabbitmq.exchanges.transaction-exchange}")
    private String transactionExchange;

    @Value("${rabbitmq.exchanges.notification-exchange}")
    private String notificationExchange;

    @Value("${rabbitmq.queues.transaction-queue}")
    private String transactionQueue;

    @Value("${rabbitmq.queues.notification-queue}")
    private String notificationQueue;

    @Value("${rabbitmq.queues.web-socket-queue}")
    private String webSocketQueue;

    @Value("${rabbitmq.routing-keys.transaction-routing-key}")
    private String transactionRoutingKey;

    @Value("${rabbitmq.routing-keys.notification-routing-key}")
    private String notificationRoutingKey;

    @Value("${rabbitmq.routing-keys.web-socket-routing-key}")
    private String webSocketRoutingKey;

    @Bean
    public TopicExchange transactionExchange() {
        log.info("Declaring Direct Exchange Transaction: {}", transactionExchange);
        return new TopicExchange(transactionExchange, true, false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        log.info("Declaring Direct Exchange Notification: {}", notificationExchange);
        return new TopicExchange(notificationExchange, true, false);
    }

    @Bean
    public Queue transactionQueue() {
        log.info("Declaring Queue Transaction: {}", transactionQueue);
        return new Queue(transactionQueue, true);
    }

    @Bean
    public Binding transactionBinding(){
        log.info("Binding Queue Transaction {} to Exchange {} with Routing Key: {}", transactionQueue, transactionExchange, transactionRoutingKey);

        return BindingBuilder
                .bind(transactionQueue())
                .to(transactionExchange())
                .with(transactionRoutingKey);
    }


    @Bean
    public Queue notificationQueue() {
        log.info("Declaring Queue Notification: {}", notificationQueue);
        return new Queue(notificationQueue, true);
    }

    @Bean
    public Binding notificationBinding(){
        log.info("Binding Queue Notification {} to Exchange {} with Routing Key: {}", notificationQueue, notificationExchange, notificationRoutingKey);

        return BindingBuilder
                .bind(notificationQueue())
                .to(notificationExchange())
                .with(notificationRoutingKey);
    }

    @Bean
    public Queue webSocketQueue() {
        log.info("Declaring Queue Web Socket: {}", webSocketQueue);
        return new Queue(webSocketQueue, true);
    }

    @Bean
    public Binding webSocketBinding(){
        log.info("Binding Queue Web Socket {} to Exchange {} with Routing Key: {}", webSocketQueue, notificationExchange, webSocketRoutingKey);

        return BindingBuilder
                .bind(webSocketQueue())
                .to(notificationExchange())
                .with(webSocketRoutingKey);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(){
        log.info("Creating Jackson2JsonMessageConverter Bean");

        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory){
        log.info("Creating RabbitTemplate Bean");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(factory);
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());
        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }
}
