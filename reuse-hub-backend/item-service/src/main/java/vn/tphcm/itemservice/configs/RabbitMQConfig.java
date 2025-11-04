/*
 * @ (#) RabbitMQConfig.java       1.0     9/19/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 9/19/2025
 */

import ch.qos.logback.classic.pattern.MessageConverter;
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
    @Value("${rabbitmq.exchange.item}")
    private String EXCHANGE_ITEM;
    @Value("${rabbitmq.exchange.notification}")
    private String EXCHANGE_NOTIFICATION;
    @Value("${rabbitmq.exchange.saga}")
    private String SAGA_EXCHANGE;

    @Value("${rabbitmq.queue.item.created}")
    private String QUEUE_ITEM_CREATED;
    @Value("${rabbitmq.queue.item.liked}")
    private String QUEUE_ITEM_LIKED;
    @Value("${rabbitmq.queue.item.unliked}")
    private String QUEUE_ITEM_UNLIKED;
    @Value("${rabbitmq.queue.item.deleted}")
    private String QUEUE_ITEM_DELETED;
    @Value("${rabbitmq.queue.item.updated}")
    private String QUEUE_ITEM_UPDATED;
    @Value("${rabbitmq.queue.item.viewed}")
    private String QUEUE_ITEM_VIEWED;

    @Value("${rabbitmq.routing-key.item.created}")
    private String ROUTING_KEY_ITEM_CREATED;
    @Value("${rabbitmq.routing-key.item.liked}")
    private String ROUTING_KEY_ITEM_LIKED;
    @Value("${rabbitmq.routing-key.item.unliked}")
    private String ROUTING_KEY_ITEM_UNLIKED;
    @Value("${rabbitmq.routing-key.item.deleted}")
    private String ROUTING_KEY_ITEM_DELETED;
    @Value("${rabbitmq.routing-key.item.updated}")
    private String ROUTING_KEY_ITEM_UPDATED;
    @Value("${rabbitmq.routing-key.item.viewed}")
    private String ROUTING_KEY_ITEM_VIEWED;

    @Value("${rabbitmq.routing-key.transaction.created}")
    private String transactionCreatedRK;
    @Value("${rabbitmq.routing-key.transaction.cancelled}")
    private String transactionCancelledRK;
    @Value("${rabbitmq.routing-key.transaction.completed}")
    private String transactionCompletedRK;
    @Value("${rabbitmq.routing-key.saga-feedback.submitted}")
    private String feedbackSubmittedRK;
    @Value("${rabbitmq.queue.item-process}")
    private String itemProcessQueue;
    @Value("${rabbitmq.queue.feedback-process}")
    private String feedbackSubmittedQueue;

    @Value("${rabbitmq.routing-key.payment.completed}")
    private String paymentCompletedRK;
    @Value("${rabbitmq.routing-key.payment.failed}")
    private String paymentFailedRK;
    @Value("${rabbitmq.queue.payment.item-boost}")
    private String itemPaymentQueue;

    @Bean
    public TopicExchange itemExchange() {
        log.info("Declaring Topic Exchange Item: {}", EXCHANGE_ITEM);
        return new TopicExchange(EXCHANGE_ITEM, true , false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        log.info("Declaring Topic Exchange Notification: {}", EXCHANGE_NOTIFICATION);
        return new TopicExchange(EXCHANGE_NOTIFICATION, true , false);
    }

    @Bean
    public TopicExchange sagaExchange() {
        log.info("Declaring Topic Exchange Saga: {}", SAGA_EXCHANGE);
        return new TopicExchange(SAGA_EXCHANGE, true , false);
    }

    @Bean
    public Queue itemProcessQueue() {
        log.info("Declaring Queue Item Process: {}", itemProcessQueue);
        return new Queue(itemProcessQueue, true);
    }

    @Bean
    public Queue feedbackSubmittedQueue() {
        log.info("Declaring Queue Feedback Submitted Process: {}", feedbackSubmittedQueue);
        return new Queue(feedbackSubmittedQueue, true);
    }

    @Bean
    public Binding transactionCreatedBinding(Queue itemProcessQueue, TopicExchange sagaExchange){
        log.info("Binding Queue Item Process {} to Exchange {} with Routing Key: {}", itemProcessQueue.getName(), SAGA_EXCHANGE, transactionCreatedRK);

        return BindingBuilder
                .bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCreatedRK);
    }

    @Bean
    public Binding paymentCompletedBinding(Queue itemPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemPaymentQueue)
                .to(sagaExchange)
                .with(paymentCompletedRK);
    }

    @Bean
    public Binding paymentFailedBinding(Queue itemPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemPaymentQueue)
                .to(sagaExchange)
                .with(paymentFailedRK);
    }

    @Bean
    public Binding transactionCancelledBinding(Queue itemProcessQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCancelledRK);
    }

    @Bean
    Binding transactionCompletedBinding(Queue itemProcessQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCompletedRK);
    }

    @Bean
    Binding feedbackSubmittedBinding(Queue feedbackSubmittedQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(feedbackSubmittedQueue)
                .to(sagaExchange)
                .with(feedbackSubmittedRK);
    }

    @Bean
    public Queue itemCreatedQueue() {
        log.info("Declaring Queue Created Item: {}", QUEUE_ITEM_CREATED);
        return new Queue(QUEUE_ITEM_CREATED, true);
    }

    @Bean
    public Binding itemCreatedBinding(){
        log.info("Binding Queue Created Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_CREATED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_CREATED);

        return BindingBuilder
                .bind(itemCreatedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_CREATED);
    }

    @Bean
    public Queue itemLikedQueue() {
        log.info("Declaring Queue Liked Item: {}", QUEUE_ITEM_LIKED);
        return new Queue(QUEUE_ITEM_LIKED, true);
    }

    @Bean
    public Binding itemLikedBinding(){
        log.info("Binding Queue Liked Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_LIKED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_LIKED);

        return BindingBuilder
                .bind(itemLikedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_LIKED);
    }

    @Bean
    public Queue itemUnlikedQueue() {
        log.info("Declaring Queue Unliked Item: {}", QUEUE_ITEM_UNLIKED);
        return new Queue(QUEUE_ITEM_UNLIKED, true);
    }

    @Bean
    public Binding itemUnlikedBinding(){
        log.info("Binding Queue Unliked Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_UNLIKED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_UNLIKED);

        return BindingBuilder
                .bind(itemUnlikedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_UNLIKED);
    }

    @Bean
    public Queue itemDeletedQueue() {
        log.info("Declaring Queue Deleted Item: {}", QUEUE_ITEM_DELETED);
        return new Queue(QUEUE_ITEM_DELETED, true);
    }

    @Bean
    public Binding itemDeletedBinding(){
        log.info("Binding Queue Deleted Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_DELETED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_DELETED);

        return BindingBuilder
                .bind(itemDeletedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_DELETED);
    }

    @Bean
    public Queue itemUpdatedQueue() {
        log.info("Declaring Queue Updated Item: {}", QUEUE_ITEM_UPDATED);
        return new Queue(QUEUE_ITEM_UPDATED, true);
    }

    @Bean
    public Binding itemUpdatedBinding(){
        log.info("Binding Queue Updated Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_UPDATED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_UPDATED);

        return BindingBuilder
                .bind(itemUpdatedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_UPDATED);
    }

    @Bean
    public Queue itemViewedQueue() {
        log.info("Declaring Queue Viewed Item: {}", QUEUE_ITEM_VIEWED);
        return new Queue(QUEUE_ITEM_VIEWED, true);
    }

    @Bean
    public Binding itemViewedBinding(){
        log.info("Binding Queue Viewed Item {} to Exchange {} with Routing Key: {}", QUEUE_ITEM_VIEWED, EXCHANGE_ITEM, ROUTING_KEY_ITEM_VIEWED);

        return BindingBuilder
                .bind(itemViewedQueue())
                .to(itemExchange())
                .with(ROUTING_KEY_ITEM_VIEWED);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter(){
        log.info("Initializing Jackson2JsonMessageConverter");

        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory){
        log.info("Initializing RabbitTemplate with provided ConnectionFactory");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(factory);

        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());

        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }
}
