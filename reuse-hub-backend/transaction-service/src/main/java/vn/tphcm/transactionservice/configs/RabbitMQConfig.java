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
    @Value("${rabbitmq.exchanges.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.routing-keys.saga.item-reserved}")
    private String itemReservedRK;
    @Value("${rabbitmq.routing-keys.saga.item-reservation-failed}")
    private String itemReservationFailedRK;

    @Value("${rabbitmq.queues.saga.transaction-update-reserved}")
    private String transactionUpdateReservedQueue;
    @Value("${rabbitmq.queues.saga.transaction-update-failed}")
    private String transactionUpdateFailedQueue;

    @Value("${rabbitmq.routing-keys.payment.completed}")
    private String paymentCompletedRK;
    @Value("${rabbitmq.routing-keys.payment.failed}")
    private String paymentFailedRK;
    @Value("${rabbitmq.queues.payment.transaction-payment}")
    private String transactionPaymentQueue;

    private static final String DEAD_LETTER_EXCHANGE = "ex.dead-letter";

    private static final String TX_RESERVED_DLQ = "q.saga.transaction-update-reserved.dlq";
    private static final String TX_FAILED_DLQ = "q.saga.transaction-update-failed.dlq";
    private static final String TX_PAYMENT_DLQ = "q.saga.transaction-payment.dlq";

    private static final String TX_RESERVED_DLQ_RK = "dlq.tx-reserved";
    private static final String TX_FAILED_DLQ_RK = "dlq.tx-failed";
    private static final String TX_PAYMENT_DLQ_RK = "dlq.tx-payment";

    private static final String X_DEAD_LETTER_EXCHANGE = "x-dead-letter-exchange";
    private static final String X_DEAD_LETTER_ROUTING_KEY = "x-dead-letter-routing-key";

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
    public TopicExchange sagaExchange(){
        log.info("Declaring Direct Exchange Saga: {}", sagaExchange);
        return new TopicExchange(sagaExchange, true, false);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        log.info("Declaring Dead Letter Exchange: {}", DEAD_LETTER_EXCHANGE);
        return new TopicExchange(DEAD_LETTER_EXCHANGE, true, false);
    }

    @Bean
    public Queue transactionUpdateReservedQueue() {
        return QueueBuilder.durable(transactionUpdateReservedQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, TX_RESERVED_DLQ_RK)
                .build();
    }
    @Bean
    public Queue transactionUpdateReservedDLQ() { return QueueBuilder.durable(TX_RESERVED_DLQ).build(); }

    @Bean
    public Queue transactionUpdateFailedQueue() {
        return QueueBuilder.durable(transactionUpdateFailedQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, TX_FAILED_DLQ_RK)
                .build();
    }

    @Bean
    public Queue transactionUpdateFailedDLQ() { return QueueBuilder.durable(TX_FAILED_DLQ).build(); }

    @Bean
    public Queue transactionPaymentQueue() {
        return QueueBuilder.durable(transactionPaymentQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, TX_PAYMENT_DLQ_RK)
                .build();
    }
    @Bean
    public Queue transactionPaymentDLQ() { return QueueBuilder.durable(TX_PAYMENT_DLQ).build(); }
    @Bean
    public Binding itemReservedBinding(Queue transactionUpdateReservedQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(transactionUpdateReservedQueue)
                .to(sagaExchange)
                .with(itemReservedRK);
    }

    @Bean
    public Binding itemReservationFailedBinding(Queue transactionUpdateFailedQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(transactionUpdateFailedQueue)
                .to(sagaExchange)
                .with(itemReservationFailedRK);
    }

    @Bean
    public Binding transPaymentCompletedBinding(Queue transactionPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(transactionPaymentQueue)
                .to(sagaExchange)
                .with(paymentCompletedRK);
    }

    @Bean
    public Binding transPaymentFailedBinding(Queue transactionPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(transactionPaymentQueue)
                .to(sagaExchange)
                .with(paymentFailedRK);
    }

    @Bean
    public Binding txReservedDLQBinding(Queue transactionUpdateReservedDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(transactionUpdateReservedDLQ).to(deadLetterExchange).with(TX_RESERVED_DLQ_RK);
    }
    @Bean
    public Binding txFailedDLQBinding(Queue transactionUpdateFailedDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(transactionUpdateFailedDLQ).to(deadLetterExchange).with(TX_FAILED_DLQ_RK);
    }
    @Bean
    public Binding txPaymentDLQBinding(Queue transactionPaymentDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(transactionPaymentDLQ).to(deadLetterExchange).with(TX_PAYMENT_DLQ_RK);
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
