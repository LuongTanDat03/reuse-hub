/*
 * @ (#) RabbitMQConfig.java       1.0     10/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 10/28/2025
 */

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
    public static final String EXCHANGE_PROFILE = "ex.profile";
    public static final String RK_PROFILE_CREATE = "rk.profile.create";
    public static final String Q_PROFILE_CREATE = "q.profile.create";

    @Bean
    public TopicExchange profileExchange() {
        return new TopicExchange(EXCHANGE_PROFILE, true, false);
    }

    @Bean
    public Queue profileCreateQueue() {
        return new Queue(Q_PROFILE_CREATE, true);
    }

    @Bean
    public Binding profileCreateBinding() {
        return BindingBuilder
                .bind(profileCreateQueue())
                .to(profileExchange())
                .with(RK_PROFILE_CREATE);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter messageConverter) {
        log.info("Initializing RabbitTemplate with provided ConnectionFactory");

        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(messageConverter);

        rabbitTemplate.setMandatory(true);

        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        log.info("Initializing Jackson2JsonMessageConverter");

        return new Jackson2JsonMessageConverter();
    }

}
