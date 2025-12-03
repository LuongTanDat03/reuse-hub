/*
 * @ (#) RabbitMQConfig.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
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
    @Value("${rabbitmq.queue.ai-scan}")
    private String aiScanQueue;

    private static final String ITEM_EXCHANGE = "ex.item";
    private static final String ITEM_CREATED_RK = "r.item.created";

    @Bean
    public Queue aiScanQueue() {
        return new Queue(aiScanQueue, true);
    }

    @Bean
    public TopicExchange itemExchange() {
        return new TopicExchange(ITEM_EXCHANGE);
    }

    @Bean
    public Binding binding(Queue aiScanQueue, TopicExchange itemExchange) {
        return BindingBuilder.bind(aiScanQueue).to(itemExchange).with(ITEM_CREATED_RK);
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
