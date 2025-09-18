/*
 * @ (#) AddressRepository.java       1.0     9/6/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.repositories;

/*
 * @author: Luong Tan Dat
 * @date: 9/6/2025
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.tphcm.profileservice.models.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, String> {
}
