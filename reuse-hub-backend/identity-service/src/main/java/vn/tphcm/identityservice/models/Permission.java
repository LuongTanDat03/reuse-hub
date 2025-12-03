/*
 * @ (#) Permission.java       1.0     8/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/12/2025
 */

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_permission")
public class Permission extends AbstractEntity<String> {

    private String name;

    private String description;

    private String resource;

    private String action;

    @OneToMany(mappedBy = "permission")
    private Set<RoleHasPermission> roleHasPermissions = new HashSet<>();
}
