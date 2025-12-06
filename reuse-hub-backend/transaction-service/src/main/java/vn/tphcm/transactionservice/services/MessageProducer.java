/*
 * @ (#) MessagePublisher.java       1.0     10/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.services;

import vn.tphcm.event.dto.*;

/*
 * @author: Luong Tan Dat
 * @date: 10/24/2025
 */

public interface MessageProducer {
    void publishTransactionEvent(TransactionEventMessage event);

    void publishUpdateTransactionEvent(TransactionUpdateEvent event);

    void publishNotification(NotificationMessage event);

    void publishFeedbackEvent(FeedbackEvent event);

    void publishWalletEvent(WalletEvent event);
}
