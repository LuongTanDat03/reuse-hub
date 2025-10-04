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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j(topic = "RABBIT-MQ-CONFIG")
public class RabbitMQConfig {
    public static final String EXCHANGE_ITEM = "item.exchange";
    public static final String EXCHANGE_NOTIFICATION = "notification.exchange";

    public static final String QUEUE_ITEM_CREATED = "item.created.queue";
    public static final String QUEUE_ITEM_LIKED = "item.liked.queue";
    public static final String QUEUE_ITEM_UNLIKED = "item.unliked.queue";
    public static final String QUEUE_ITEM_DELETED = "item.deleted.queue";
    public static final String QUEUE_ITEM_UPDATED = "item.updated.queue";
    public static final String QUEUE_ITEM_VIEWED = "item.viewed.queue";

    public static final String ROUTING_KEY_ITEM_CREATED = "item.created";
    public static final String ROUTING_KEY_ITEM_LIKED = "item.liked";
    public static final String ROUTING_KEY_ITEM_UNLIKED = "item.unliked";
    public static final String ROUTING_KEY_ITEM_DELETED = "item.deleted";
    public static final String ROUTING_KEY_ITEM_UPDATED = "item.updated";
    public static final String ROUTING_KEY_ITEM_VIEWED = "item.viewed";

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
