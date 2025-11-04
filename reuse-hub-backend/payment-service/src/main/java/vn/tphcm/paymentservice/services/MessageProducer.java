/*
 * @ (#) MessageProducer.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import vn.tphcm.event.dto.NotificationMessage;
import vn.tphcm.event.dto.PaymentEvent;

public interface MessageProducer {
    void publishPaymentCompletedEvent(PaymentEvent event);

    void publishPaymentFailedEvent(PaymentEvent event);

    void publishNotification(NotificationMessage message);
}
