/*
 * @ (#) MessageConsumer.java       1.0     11/21/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.recommendationservice.services;

import org.springframework.messaging.handler.annotation.Payload;

/*
 * @author: Luong Tan Dat
 * @date: 11/21/2025
 */
public interface MessageConsumer {
    void handleEvent(@Payload Object message);
}
