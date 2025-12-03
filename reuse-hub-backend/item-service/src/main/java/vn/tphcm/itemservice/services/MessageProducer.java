/*
 * @ (#) MessageProducer.java       1.0     9/20/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 9/20/2025
 */

import vn.tphcm.event.dto.EventMessage;
import vn.tphcm.event.dto.ItemReservationEvent;
import vn.tphcm.event.dto.NotificationMessage;

public interface MessageProducer {
    void publishItemEvent(EventMessage event);

    void publishNotification(NotificationMessage notification);

    void publishItemReservationResult(ItemReservationEvent event);
}
