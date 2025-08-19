/*
 * @ (#) JwtService.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.reusehubbackend.commons.TokenType;

import java.util.List;

@Service
public interface JwtService {
    String generateAccessToken(String userId, List<String> authorities);

    String generateRefreshToken(String userId, List<String> authorities);

    String extractUsername(String token, TokenType tokenType);

    void deleteToken(String userId);
}
