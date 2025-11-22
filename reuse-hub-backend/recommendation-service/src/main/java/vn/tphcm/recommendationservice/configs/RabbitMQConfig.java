/*
 * @ (#) RabbitMQConfig.java       1.0     11/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 11/12/2025
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
@Slf4j(topic = "RABBIT-MQ-CONFIG")
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.item}")
    private String itemExchange;

    @Value("${rabbitmq.exchange.transaction}")
    private String transactionExchange;

    @Value("${rabbitmq.routing-key.item.viewed}")
    private String viewedItemRK;

    @Value("${rabbitmq.routing-key.item.liked}")
    private String likedItemRK;

    @Value("${rabbitmq.routing-key.transaction.completed}")
    private String completedTransactionRK;

    @Value("${rabbitmq.queue.recommendation}")
    private String recommendationQueue;

    @Bean
    public TopicExchange itemExchange() {
        log.info("Item Exchange: {}", itemExchange);
        return new TopicExchange(itemExchange);
    }

    @Bean
    public TopicExchange transactionExchange() {
        log.info("Transaction Exchange: {}", transactionExchange);
        return new TopicExchange(transactionExchange);
    }

    @Bean
    public Queue recommendationQueue() {
        log.info("Recommendation Queue: {}", recommendationQueue);
        return new Queue(recommendationQueue, true);
    }

    @Bean
    public Binding itemViewedBinding(Queue recommendationQueue, TopicExchange itemExchange) {
        log.info("Binding Recommendation Queue to Item Viewed with RK: {}", viewedItemRK);
        return BindingBuilder
                .bind(recommendationQueue)
                .to(itemExchange)
                .with(viewedItemRK);
    }

    @Bean
    public Binding itemLikedBinding(Queue recommendationQueue, TopicExchange itemExchange) {
        log.info("Binding Recommendation Queue to Item Liked with RK: {}", likedItemRK);
        return BindingBuilder
                .bind(recommendationQueue)
                .to(itemExchange)
                .with(likedItemRK);
    }

    @Bean
    public Binding completedTransactionBinding(Queue recommendationQueue, TopicExchange transactionExchange) {
        log.info("Binding Recommendation Queue to Transaction Completed with RK: {}", completedTransactionRK);
        return BindingBuilder
                .bind(recommendationQueue)
                .to(transactionExchange)
                .with(completedTransactionRK);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        log.info("Initializing Jackson2JsonMessageConverter");

        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        log.info("Initializing RabbitTemplate with provided ConnectionFactory");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(factory);

        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());

        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }
}
