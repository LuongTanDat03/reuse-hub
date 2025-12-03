/*
 * @ (#) MessageConsumer.java       1.0     11/22/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.aiservice.services;
/*
 * @author: Luong Tan Dat
 * @date: 11/22/2025
 */

import event.dto.EventMessage;

public interface MessageConsumer {
    void handleItemCreated(EventMessage event);
}
