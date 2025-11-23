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
    @Value("${rabbitmq.exchange.item}")
    private String exchangeItem;
    @Value("${rabbitmq.exchange.notification}")
    private String exchangeNotification;
    @Value("${rabbitmq.exchange.saga}")
    private String sagaExchange;

    @Value("${rabbitmq.queue.item.created}")
    private String queueItemCreated;
    @Value("${rabbitmq.queue.item.liked}")
    private String queueItemLiked;
    @Value("${rabbitmq.queue.item.unliked}")
    private String queueItemUnliked;
    @Value("${rabbitmq.queue.item.deleted}")
    private String queueItemDeleted;
    @Value("${rabbitmq.queue.item.updated}")
    private String queueItemUpdated;
    @Value("${rabbitmq.queue.item.viewed}")
    private String queueItemViewed;

    @Value("${rabbitmq.routing-key.item.created}")
    private String routingKeyItemCreated;
    @Value("${rabbitmq.routing-key.item.liked}")
    private String routingKeyItemLiked;
    @Value("${rabbitmq.routing-key.item.unliked}")
    private String routingKeyItemUnliked;
    @Value("${rabbitmq.routing-key.item.deleted}")
    private String routingKeyItemDeleted;
    @Value("${rabbitmq.routing-key.item.updated}")
    private String routingKeyItemUpdated;
    @Value("${rabbitmq.routing-key.item.viewed}")
    private String routingKeyItemViewed;

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
    @Value("${rabbitmq.routing-key.payment.cancelled}")
    private String paymentFailedRK;
    @Value("${rabbitmq.queue.payment.item-boost}")
    private String itemPaymentQueue;

    private static final String AI_TAGS_QUEUE = "q.item.update-tags";
    private static final String AI_TAGS_RK = "r.ai.tags.generated";

    private static final String DEAD_LETTER_EXCHANGE = "ex.dead-letter";

    private static final String ITEM_PROCESS_DLQ = "q.saga.item-process.dlq";
    private static final String FEEDBACK_RECEIVE_DLQ = "q.saga.feedback-receive.dlq";
    private static final String ITEM_PAYMENT_DLQ = "q.saga.item-payment-boost.dlq";

    private static final String ITEM_PROCESS_DLQ_RK = "dlq.item-process";
    private static final String FEEDBACK_RECEIVE_DLQ_RK = "dlq.feedback-receive";
    private static final String ITEM_PAYMENT_DLQ_RK = "dlq.item-payment";

    private static final String X_DEAD_LETTER_EXCHANGE = "x-dead-letter-exchange";
    private static final String X_DEAD_LETTER_ROUTING_KEY = "x-dead-letter-routing-key";


    @Bean
    public TopicExchange itemExchange() {
        log.info("Declaring Topic Exchange Item: {}", exchangeItem);
        return new TopicExchange(exchangeItem, true , false);
    }

    @Bean
    public TopicExchange notificationExchange() {
        log.info("Declaring Topic Exchange Notification: {}", exchangeNotification);
        return new TopicExchange(exchangeNotification, true , false);
    }

    @Bean
    public TopicExchange sagaExchange() {
        log.info("Declaring Topic Exchange Saga: {}", sagaExchange);
        return new TopicExchange(sagaExchange, true , false);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        log.info("Declaring Dead Letter Exchange: {}", DEAD_LETTER_EXCHANGE);
        return new TopicExchange(DEAD_LETTER_EXCHANGE, true, false);
    }

    @Bean
    public Queue aiTagsQueue() {
        return new Queue(AI_TAGS_QUEUE, true);
    }

    @Bean
    public Binding aiTagsBinding(Queue aiTagsQueue, TopicExchange itemExchange) {
        return BindingBuilder.bind(aiTagsQueue).to(itemExchange).with(AI_TAGS_RK);
    }
    @Bean
    public Queue itemProcessQueue() {
        return QueueBuilder.durable(itemProcessQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, ITEM_PROCESS_DLQ_RK)
                .build();
    }

    @Bean
    public Queue feedbackSubmittedQueue() {
        log.info("Declaring Queue Feedback Submitted Process: {}", feedbackSubmittedQueue);
        return QueueBuilder.durable(feedbackSubmittedQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, FEEDBACK_RECEIVE_DLQ_RK)
                .build();
    }

    @Bean
    public Queue feedbackReceiveDLQ() {
        log.info("Declaring Dead Letter Queue for Feedback Receive: {}", FEEDBACK_RECEIVE_DLQ);
        return QueueBuilder.durable(FEEDBACK_RECEIVE_DLQ).build();
    }

    @Bean
    public Binding transactionCreatedBinding(Queue itemProcessQueue, TopicExchange sagaExchange){
        log.info("Binding Queue Item Process {} to Exchange {} with Routing Key: {}", itemProcessQueue.getName(), sagaExchange, transactionCreatedRK);

        return BindingBuilder
                .bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCreatedRK);
    }

    @Bean
    public Binding transactionCancelledBinding(Queue itemProcessQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCancelledRK);
    }

    @Bean
    public Binding transactionCompletedBinding(Queue itemProcessQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemProcessQueue)
                .to(sagaExchange)
                .with(transactionCompletedRK);
    }

    @Bean
    public Binding feedbackSubmittedBinding(Queue feedbackSubmittedQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(feedbackSubmittedQueue)
                .to(sagaExchange)
                .with(feedbackSubmittedRK);
    }

    @Bean
    public Queue itemCreatedQueue() {
        log.info("Declaring Queue Created Item: {}", queueItemCreated);
        return new Queue(queueItemCreated, true);
    }

    @Bean
    public Binding itemCreatedBinding(){
        log.info("Binding Queue Created Item {} to Exchange {} with Routing Key: {}", queueItemCreated, exchangeItem, routingKeyItemCreated);

        return BindingBuilder
                .bind(itemCreatedQueue())
                .to(itemExchange())
                .with(routingKeyItemCreated);
    }

    @Bean
    public Queue itemLikedQueue() {
        log.info("Declaring Queue Liked Item: {}", queueItemLiked);
        return new Queue(queueItemLiked, true);
    }

    @Bean
    public Binding itemLikedBinding(){
        log.info("Binding Queue Liked Item {} to Exchange {} with Routing Key: {}", queueItemLiked, exchangeItem, routingKeyItemLiked);

        return BindingBuilder
                .bind(itemLikedQueue())
                .to(itemExchange())
                .with(routingKeyItemLiked);
    }

    @Bean
    public Queue itemUnlikedQueue() {
        log.info("Declaring Queue Unliked Item: {}", queueItemUnliked);
        return new Queue(queueItemUnliked, true);
    }

    @Bean
    public Binding itemUnlikedBinding(){
        log.info("Binding Queue Unliked Item {} to Exchange {} with Routing Key: {}", queueItemUnliked, exchangeItem, routingKeyItemUnliked);

        return BindingBuilder
                .bind(itemUnlikedQueue())
                .to(itemExchange())
                .with(routingKeyItemUnliked);
    }

    @Bean
    public Queue itemDeletedQueue() {
        log.info("Declaring Queue Deleted Item: {}", queueItemDeleted);
        return new Queue(queueItemDeleted, true);
    }

    @Bean
    public Binding itemDeletedBinding(){
        log.info("Binding Queue Deleted Item {} to Exchange {} with Routing Key: {}", queueItemDeleted, exchangeItem, routingKeyItemDeleted);

        return BindingBuilder
                .bind(itemDeletedQueue())
                .to(itemExchange())
                .with(routingKeyItemDeleted);
    }

    @Bean
    public Queue itemUpdatedQueue() {
        log.info("Declaring Queue Updated Item: {}", queueItemUpdated);
        return new Queue(queueItemUpdated, true);
    }

    @Bean
    public Binding itemUpdatedBinding(){
        log.info("Binding Queue Updated Item {} to Exchange {} with Routing Key: {}", queueItemUpdated, exchangeItem, routingKeyItemUpdated);

        return BindingBuilder
                .bind(itemUpdatedQueue())
                .to(itemExchange())
                .with(routingKeyItemUpdated);
    }

    @Bean
    public Queue itemViewedQueue() {
        log.info("Declaring Queue Viewed Item: {}", queueItemViewed);
        return new Queue(queueItemViewed, true);
    }

    @Bean
    public Binding itemViewedBinding(){
        log.info("Binding Queue Viewed Item {} to Exchange {} with Routing Key: {}", queueItemViewed, exchangeItem, routingKeyItemViewed);

        return BindingBuilder
                .bind(itemViewedQueue())
                .to(itemExchange())
                .with(routingKeyItemViewed);
    }

    @Bean
    public Queue itemPaymentQueue() {
        log.info("Declaring Queue Item Payment Boost Process: {}", itemPaymentQueue);
        return QueueBuilder.durable(itemPaymentQueue)
                .withArgument(X_DEAD_LETTER_EXCHANGE, DEAD_LETTER_EXCHANGE)
                .withArgument(X_DEAD_LETTER_ROUTING_KEY, ITEM_PAYMENT_DLQ_RK)
                .build();
    }

    @Bean
    public Queue itemPaymentDLQ() {
        log.info("Declaring Dead Letter Queue for Item Payment Boost: {}", ITEM_PAYMENT_DLQ);
        return QueueBuilder.durable(ITEM_PAYMENT_DLQ).build();
    }

    @Bean
    public Binding paymentCompletedBinding(Queue itemPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemPaymentQueue).to(sagaExchange).with(paymentCompletedRK);
    }

    @Bean
    public Binding paymentFailedBinding(Queue itemPaymentQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(itemPaymentQueue).to(sagaExchange).with(paymentFailedRK);
    }

    @Bean
    public Queue itemProcessDLQ() { return QueueBuilder.durable(ITEM_PROCESS_DLQ).build(); }
    
    @Bean
    public Binding itemProcessDLQBinding(Queue itemProcessDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(itemProcessDLQ).to(deadLetterExchange).with(ITEM_PROCESS_DLQ_RK);
    }

    @Bean
    public Binding feedbackReceiveDLQBinding(Queue feedbackReceiveDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(feedbackReceiveDLQ).to(deadLetterExchange).with(FEEDBACK_RECEIVE_DLQ_RK);
    }

    @Bean
    public Binding itemPaymentDLQBinding(Queue itemPaymentDLQ, TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(itemPaymentDLQ).to(deadLetterExchange).with(ITEM_PAYMENT_DLQ_RK);
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
