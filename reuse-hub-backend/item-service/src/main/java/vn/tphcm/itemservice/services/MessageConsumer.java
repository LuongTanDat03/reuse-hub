/*
 * @ (#) MessageConsumer.java       1.0     11/3/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 11/3/2025
 */

import vn.tphcm.event.dto.FeedbackEvent;
import vn.tphcm.event.dto.PaymentEvent;
import vn.tphcm.event.dto.TransactionEventMessage;

public interface MessageConsumer {
    void handleTransactionEvent(TransactionEventMessage event);

    void handleFeedbackSubmitted(FeedbackEvent event);

    void handlePaymentEvent(PaymentEvent event);
}
