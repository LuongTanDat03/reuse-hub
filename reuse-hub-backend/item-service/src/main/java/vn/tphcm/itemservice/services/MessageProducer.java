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
import org.springframework.stereotype.Service;
import vn.tphcm.event.dto.NotificationMessage;

@Service
public interface MessageProducer {
    void publishItemEvent(EventMessage event);

    void publishNotification(NotificationMessage notification);
}
