/*
 * @ (#) MessageConsumerImpl.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */

import com.rabbitmq.client.Channel;
import event.dto.AiTagsGeneratedEvent;
import event.dto.EventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import vn.tphcm.aiservice.services.GeminiService;
import vn.tphcm.aiservice.services.MessageConsumer;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONSUMER")
public class MessageConsumerImpl implements MessageConsumer {
    private final GeminiService geminiService;
    private final RabbitTemplate rabbitTemplate;

    private static final String EXCHANGE_NAME = "ex.item";
    private static final String ROUTING_KEY_TAGS = "r.ai.tags.generated";

    @Override
    @RabbitListener(queues = "q.saga.ai-scan")
    public void handleItemCreated(EventMessage event, Channel channel, Message message) throws Exception {
        log.info("Received ITEM_CREATED for AI Scan: {}", event.getItemId());

        if (event.getImages() == null || event.getImages().isEmpty()) {
            log.warn("No images to analyze for item {}", event.getItemId());
            return;
        }

        try {
            String mainImage = event.getImages().get(0);
            List<String> aiTags = geminiService.generateTagsFromImage(mainImage);

            if (!aiTags.isEmpty()) {
                log.info("AI Tags generated: {}", aiTags);

                AiTagsGeneratedEvent responseEvent = AiTagsGeneratedEvent.builder()
                        .itemId(event.getItemId())
                        .tags(aiTags)
                        .build();

                rabbitTemplate.convertAndSend(EXCHANGE_NAME, ROUTING_KEY_TAGS, responseEvent);
                log.info("AI Service: Published AI_TAGS_GENERATED event for item {}", event.getItemId());
                channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
            }
        } catch (Exception e) {
            log.error("AI Service Error: {}", e.getMessage());
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}
