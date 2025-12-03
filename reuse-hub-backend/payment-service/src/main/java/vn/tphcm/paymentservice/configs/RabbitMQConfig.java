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

    @Value("${rabbitmq.queue.saga.payment-completed}")
    private String paymentCompletedQueue;

    private static final String DEAD_LETTER_EXCHANGE = "ex.dead-letter";
    private static final String PAYMENT_REFUND_DLQ = "q.saga.payment-refund.dlq";
    private static final String PAYMENT_COMPLETED_DLQ = "q.saga.payment-completed.dlq";
    private static final String PAYMENT_REFUND_DLQ_RK = "dlq.payment-refund";
    private static final String PAYMENT_COMPLETED_DLQ_RK = "dlq.payment-completed";
    private static final String X_DEAD_LETTER_EXCHANGE = "x-dead-letter-exchange";
    private static final String X_DEAD_LETTER_ROUTING_KEY = "x-dead-letter-routing-key";

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
    public TopicExchange deadLetterExchange() {
        log.info("Creating Dead Letter Exchange: {}", DEAD_LETTER_EXCHANGE);
        return new TopicExchange(DEAD_LETTER_EXCHANGE, true, false);
    }

    @Bean
    public Queue paymentRefundQueue() {
        log.info("Creating Payment Refund Queue with DLQ: {}", paymentRefundQueue);
        return QueueBuilder.durable(paymentRefundQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, PAYMENT_REFUND_DLQ_RK)
                .build();
    }

    @Bean
    public Queue paymentRefundDLQ() {
        log.info("Creating Payment Refund DLQ: {}", PAYMENT_REFUND_DLQ);
        return QueueBuilder.durable(PAYMENT_REFUND_DLQ).build();
    }

    @Bean
    public Queue paymentCompletedQueue() {
        log.info("Creating Payment Completed Queue with DLQ: {}", paymentCompletedQueue);
        return QueueBuilder.durable(paymentCompletedQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, PAYMENT_COMPLETED_DLQ_RK)
                .build();
    }

    @Bean
    public Queue paymentCompletedDLQ() {
        log.info("Creating Payment Completed DLQ: {}", PAYMENT_COMPLETED_DLQ);
        return QueueBuilder.durable(PAYMENT_COMPLETED_DLQ).build();
    }

    @Bean
    public Binding paymentCompletedBinding(Queue paymentCompletedQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(paymentCompletedQueue).to(sagaExchange).with(paymentCompletedRK);
    }

    @Bean
    public Binding refundBinding(Queue paymentRefundQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(paymentRefundQueue).to(sagaExchange).with(transactionCancelledRK);
    }

    @Bean
    public Binding paymentRefundDLQBinding(Queue paymentRefundDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(paymentRefundDLQ).to(deadLetterExchange).with(PAYMENT_REFUND_DLQ_RK);
    }

    @Bean
    public Binding paymentCompletedDLQBinding(Queue paymentCompletedDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(paymentCompletedDLQ).to(deadLetterExchange).with(PAYMENT_COMPLETED_DLQ_RK);
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
