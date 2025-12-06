/*
 * @ (#) MessageConsumer.java       1.0     10/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 10/28/2025
 */

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import vn.tphcm.event.dto.ItemReservationEvent;
import vn.tphcm.event.dto.PaymentEvent;

import java.io.IOException;

public interface MessageConsumer {
    void handleItemReserved(ItemReservationEvent event, Channel channel, Message message) throws IOException;

    void handleItemReservationFailed(ItemReservationEvent event);

    void handlePaymentEvent(PaymentEvent event);
}
