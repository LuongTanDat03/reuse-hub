package vn.tphcm.auctionservice.configs;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.auction}")
    private String auctionExchange;

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.queue.auction.created}")
    private String auctionCreatedQueue;

    @Value("${rabbitmq.queue.auction.bid-placed}")
    private String bidPlacedQueue;

    @Value("${rabbitmq.queue.auction.outbid}")
    private String outbidQueue;

    @Value("${rabbitmq.queue.auction.ended}")
    private String auctionEndedQueue;

    @Value("${rabbitmq.routing-key.auction.created}")
    private String auctionCreatedRoutingKey;

    @Value("${rabbitmq.routing-key.auction.bid-placed}")
    private String bidPlacedRoutingKey;

    @Value("${rabbitmq.routing-key.auction.outbid}")
    private String outbidRoutingKey;

    @Value("${rabbitmq.routing-key.auction.ended}")
    private String auctionEndedRoutingKey;

    // Exchanges
    @Bean
    public TopicExchange auctionExchange() {
        return new TopicExchange(auctionExchange);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(notificationExchange);
    }

    // Queues
    @Bean
    public Queue auctionCreatedQueue() {
        return QueueBuilder.durable(auctionCreatedQueue).build();
    }

    @Bean
    public Queue bidPlacedQueue() {
        return QueueBuilder.durable(bidPlacedQueue).build();
    }

    @Bean
    public Queue outbidQueue() {
        return QueueBuilder.durable(outbidQueue).build();
    }

    @Bean
    public Queue auctionEndedQueue() {
        return QueueBuilder.durable(auctionEndedQueue).build();
    }

    // Bindings
    @Bean
    public Binding auctionCreatedBinding() {
        return BindingBuilder.bind(auctionCreatedQueue())
                .to(auctionExchange())
                .with(auctionCreatedRoutingKey);
    }

    @Bean
    public Binding bidPlacedBinding() {
        return BindingBuilder.bind(bidPlacedQueue())
                .to(auctionExchange())
                .with(bidPlacedRoutingKey);
    }

    @Bean
    public Binding outbidBinding() {
        return BindingBuilder.bind(outbidQueue())
                .to(auctionExchange())
                .with(outbidRoutingKey);
    }

    @Bean
    public Binding auctionEndedBinding() {
        return BindingBuilder.bind(auctionEndedQueue())
                .to(auctionExchange())
                .with(auctionEndedRoutingKey);
    }

    // Message Converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
