/*
 * @ (#) VerificationPublisher.java       1.0     8/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/18/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.reusehubbackend.contracts.VerificationMessage;

@Service
public interface MessageProducer {
    void publishVerificationEmail(VerificationMessage verificationMessage);
}
