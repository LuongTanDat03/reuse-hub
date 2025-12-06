/*
 * @ (#) MessageConsumer.java       1.0     12/4/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.services;

import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.event.dto.WalletEvent;
import vn.tphcm.profileservice.models.User;
import vn.tphcm.profileservice.repositories.UserRepository;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "WALLET-MESSAGE-CONSUMER")
public class MessageConsumer {
    private final UserRepository userRepository;

    @RabbitListener(queues = "${rabbitmq.queues.wallet.credit}")
    @Transactional
    public void handleWalletCredit(WalletEvent event, Channel channel, 
                                   @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        try {
            log.info("Received wallet credit event for user {}: {} VND", event.getUserId(), event.getAmount());
            
            User user = userRepository.findByUserId(event.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + event.getUserId()));
            
            Long currentWallet = user.getWallet() != null ? user.getWallet() : 0L;
            Long amountToAdd = event.getAmount();
            Long newWallet = currentWallet + amountToAdd;
            user.setWallet(newWallet);
            
            userRepository.save(user);
            
            log.info("Wallet updated for user {}: {} -> {} VND (added {} VND from transaction {})", 
                     event.getUserId(), currentWallet, newWallet, amountToAdd, event.getTransactionId());
            
            channel.basicAck(tag, false);
        } catch (Exception e) {
            log.error("Failed to process wallet credit event for user {}: {}", event.getUserId(), e.getMessage(), e);
            try {
                channel.basicNack(tag, false, false);
            } catch (IOException ioException) {
                log.error("Failed to NACK message: {}", ioException.getMessage());
            }
        }
    }
}
