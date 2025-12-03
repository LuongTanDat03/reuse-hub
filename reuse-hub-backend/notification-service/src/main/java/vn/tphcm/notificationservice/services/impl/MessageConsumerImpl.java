package vn.tphcm.notificationservice.services.impl;

import com.rabbitmq.client.Channel;
import event.dto.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import vn.tphcm.notificationservice.services.MessageConsumer;
import vn.tphcm.notificationservice.services.NotificationService;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "MESSAGE-CONSUMER")
public class MessageConsumerImpl implements MessageConsumer {
    private final NotificationService notificationService;

    @Override
    @RabbitListener(queues = "${rabbitmq.queue.notification}")
    public void consumeNotification(NotificationMessage message, Message amqpMessage, Channel channel) {
        try {
            log.info("Received notification message: type={}, userId={}", 
                    message.getType(), message.getRecipientUserId());
            
            notificationService.createNotification(
                    message.getRecipientUserId(),
                    message.getTitle(),
                    message.getMessage(),
                    message.getType(),
                    message.getItemId() != null ? message.getItemId() : message.getTransactionId()
            );
            
            channel.basicAck(amqpMessage.getMessageProperties().getDeliveryTag(), false);
            log.info("Notification processed successfully for user: {}", message.getRecipientUserId());
            
        } catch (Exception e) {
            log.error("Error processing notification: {}", e.getMessage(), e);
            try {
                channel.basicNack(amqpMessage.getMessageProperties().getDeliveryTag(), false, false);
            } catch (Exception ex) {
                log.error("Error sending NACK: {}", ex.getMessage());
            }
        }
    }
}
