/*
 * @ (#) MessageType.java       1.0     8/26/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */
package vn.tphcm.chatservice.commons;

/*
 * @author: Luong Tan Dat
 * @date: 8/26/2025
 */

public enum MessageType {
    TEXT,
    IMAGE,
    VIDEO,
    AUDIO,
    FILE,
    EMOJI,
    LOCATION,
    CONTACT,
    STICKER,
    GIF,
    // Price negotiation types
    PRICE_OFFER,      // Buyer sends a price offer
    OFFER_ACCEPTED,   // Seller accepts the offer
    OFFER_REJECTED,   // Seller rejects the offer
    OFFER_COUNTERED   // Seller counters with a different price
}
