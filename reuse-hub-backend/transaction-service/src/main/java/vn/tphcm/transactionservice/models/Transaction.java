/*
 * @ (#) Transaction.java       1.0     8/24/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/24/2025
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.tphcm.transactionservice.commons.TransactionStatus;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_transaction")
public class Transaction extends AbstractEntity<String> implements Serializable {
    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "giver_id", nullable = false)
    private Long giverId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TransactionStatus status;

    @Column(name = "feedback_giver")
    private String feedbackGiver;

    @Column(name = "feedback_receiver")
    private String feedbackReceiver;

    @Column(name = "rating_giver")
    private Integer ratingGiver;

    @Column(name = "rating_receiver")
    private Integer ratingReceiver;
}
