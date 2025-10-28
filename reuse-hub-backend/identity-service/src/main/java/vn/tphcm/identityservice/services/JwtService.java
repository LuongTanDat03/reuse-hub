/*
 * @ (#) JwtService.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.services;

/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import org.springframework.stereotype.Service;
import vn.tphcm.identityservice.commons.TokenType;

import java.util.List;

@Service
public interface JwtService {
    String generateAccessToken(String username, List<String> authorities);

    String generateRefreshToken(String username, List<String> authorities);

    String extractUsername(String token, TokenType tokenType);

    void deleteToken(String token);

    boolean isTokenValid(String token, TokenType tokenType);
}
