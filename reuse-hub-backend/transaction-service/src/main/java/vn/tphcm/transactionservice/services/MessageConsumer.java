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

import vn.tphcm.event.dto.ItemReservationEvent;

public interface MessageConsumer {
    void handleItemReserved(ItemReservationEvent event);

    void handleItemReservationFailed(ItemReservationEvent event);
}
