/*
 * @ (#) RabbitMQConfig.java       1.0     10/23/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/23/2025
 */

import lombok.RequiredArgsConstructor;
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
@Slf4j(topic = "RABBIT-MQ-CONFIG")
public class RabbitMQConfig {
    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;
    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routing-key.saga.payment-completed}")
    private String paymentCompletedRK;
    @Value("${rabbitmq.routing-key.saga.payment-failed}")
    private String paymentFailedRK;
    @Value("${rabbitmq.routing-key.notification}")
    private String notificationRK;

    @Value("${rabbitmq.routing-key.transaction}")
    private String transactionCancelledRK;

    @Value("${rabbitmq.queue.saga.payment-refund}")
    private String paymentRefundQueue;
    @Bean
    public TopicExchange sagaExchange() {
        log.info("Creating SAGA TopicExchange Bean");

        return new TopicExchange(sagaExchange, true, false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        log.info("Creating Notification TopicExchange Bean");

        return new TopicExchange(notificationExchange, true, false);
    }

    @Bean
    public Queue paymentRefundQueue() {
        return new Queue(paymentRefundQueue, true);
    }

    @Bean
    public Binding refundBinding(Queue paymentRefundQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(paymentRefundQueue).to(sagaExchange).with(transactionCancelledRK);
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
