/*
 * @ (#) user.java       1.0     8/12/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/12/2025
 */

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import vn.tphcm.identityservice.commons.UserStatus;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_user", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_username", columnList = "username"),
        @Index(name = "idx_user_phone", columnList = "phone"),
        @Index(name = "idx_user_status", columnList = "status")
})
@Builder
public class User extends AbstractEntity<String> implements UserDetails, Serializable {
    @Email
    @NotBlank
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    @NotBlank
    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<UserHasRole> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<Role> roleList = roles.stream()
                .map(UserHasRole::getRole)
                .toList();

        List<String> roleNames = roleList.stream()
                .map(Role::getName)
                .toList();

        return roleNames.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserStatus.ACTIVE.equals(status);
    }

    private void writeObject(java.io.ObjectOutputStream stream)
            throws IOException {
        stream.defaultWriteObject();
    }

    private void readObject(java.io.ObjectInputStream stream)
            throws IOException, ClassNotFoundException {
        stream.defaultReadObject();
    }
}


