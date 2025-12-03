/*
 * @ (#) WebhookEventRepository.java       1.0     11/28/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.paymentservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.paymentservice.models.WebhookEvent;

import java.util.Optional;

/*
 * @author: Luong Tan Dat
 * @date: 11/28/2025
 */

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, String> {
    Optional<WebhookEvent> findByStripeEventId(String stripeEventId);
    boolean existsByStripeEventId(String stripeEventId);
}
