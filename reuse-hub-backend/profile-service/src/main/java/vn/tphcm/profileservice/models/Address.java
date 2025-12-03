/*
 * @ (#) Address.java       1.0     8/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/12/2025
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_address", indexes = {
        @Index(name = "idx_address_city", columnList = "city"),
})
public class Address extends AbstractEntity<String> {
    @Column(name = "address_id", unique = true, nullable = false)
    private String addressId;

    @Column(name = "address_line")
    private String addressLine;

    private String ward;

    private String district;

    private String city;

    private String country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    private void generateAddressId(){
        if (this.addressId == null || this.addressId.isEmpty()) {
            this.addressId = UUID.randomUUID().toString();
        }
    }

}
