/*
 * @ (#) User.java       1.0     8/31/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.models;
/*
 * @author: Luong Tan Dat
 * @date: 8/31/2025
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import vn.tphcm.profileservice.commons.Gender;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_users", indexes = {
        @Index(name = "idx_user_user_id", columnList = "user_id", unique = true),
        @Index(name = "idx_user_email", columnList = "email", unique = true),
        @Index(name = "idx_user_phone", columnList = "phone", unique = true),
        @Index(name = "idx_user_username", columnList = "username", unique = true),
        @Index(name = "idx_user_location", columnList = "location")
})
public class User extends AbstractEntity<String> implements Serializable {
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private Gender gender;

    private LocalDate birthday;

    private String phone;

    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "rating_average")
    private double ratingAverage;

    @Column(name = "rating_count")
    private int ratingCount;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String preferences;

    private Long wallet;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private transient List<Address> address = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserHistory> histories = new ArrayList<>();

    public void replaceAddresses(List<Address> newAddresses) {
        if (this.address == null) {
            this.address = new ArrayList<>();
        }

        this.address.clear();

        if (newAddresses != null) {
            for (Address add : newAddresses) {
                add.setUser(this);
                this.address.add(add);
            }
        }
    }
}
