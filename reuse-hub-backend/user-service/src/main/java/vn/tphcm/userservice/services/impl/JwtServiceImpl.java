/*
 * @ (#) JwtServiceImpl.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.userservice.services.impl;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import vn.tphcm.userservice.commons.TokenType;
import vn.tphcm.userservice.exceptions.InvalidDataException;
import vn.tphcm.userservice.services.JwtService;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "JWT-SERVICE")
public class JwtServiceImpl implements JwtService {
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.expiryMinutes}")
    private long expiryMinutes;

    @Value("${jwt.expiryDay}")
    private long expiryDay;

    @Value("${jwt.accessKey}")
    private String accessKey;

    @Value("${jwt.refreshKey}")
    private String refreshKey;

    @Override
    public String generateAccessToken(String userId, List<String> authorities) {
        log.info("Generating access token for user: {}", userId);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("authorities", authorities);

        return generateToken(claims, userId, TokenType.ACCESS_TOKEN);
    }

    @Override
    public String generateRefreshToken(String userId, List<String> authorities) {
        log.info("Generating refresh token for user: {}", userId);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("authorities", authorities);

        return generateToken(claims, userId, TokenType.REFRESH_TOKEN);
    }

    @Override
    public String extractUsername(String token, TokenType type) {
        log.info("Extracting username from token: {} of type: {}", token, type);

        if (token == null || token.trim().isEmpty()) {
            log.error("Token is null or empty");
            throw new AccessDeniedException("Access Denied, token is null or empty");
        }

        String redisKey = getRedisPrefix(token, type);
        if (redisTemplate.opsForValue().get(redisKey) == null) {
            log.error("Token not found in Redis: {}", redisKey);
            throw new AccessDeniedException("Access Denied, token not found");
        }

        return extractClaim(type, token, Claims::getSubject);
    }

    @Override
    public void deleteToken(String userId) {
        log.info("Logout user: {}", userId);

        redisTemplate.delete(getRedisPrefix(userId, TokenType.ACCESS_TOKEN));
        redisTemplate.delete(getRedisPrefix(userId, TokenType.REFRESH_TOKEN));

        log.info("Tokens deleted successfully for user: {}", userId);
    }

    @Override
    public boolean isTokenValid(String token, TokenType type) {
        log.info("Validating token: {}", token);

        try {
            if (token == null || token.trim().isEmpty()) {
                log.error("Token is null or empty");
                return false;
            }

            String username = extractUsername(token, TokenType.ACCESS_TOKEN);

            if (username == null || username.trim().isEmpty()) {
                log.error("Username extracted from token is null or empty");
                return false;
            }

            String redisKey = getRedisPrefix(username, type);
            String storedToken = (String) redisTemplate.opsForValue().get(redisKey);

            if (storedToken == null || !storedToken.equals(token)) {
                log.error("Token not found or does not match the stored token in Redis");
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private <T> T extractClaim(TokenType type, String token, Function<Claims, T> claimsExtractor) {
        log.info("-----------------[EXTRACT CLAIM]-----------------");
        final Claims claims = extractAllClaim(type, token);
        return claimsExtractor.apply(claims);
    }

    private Claims extractAllClaim(TokenType type, String token) {
        log.info("--------------[ extractAllClaim ]--------------");
        try {
            return Jwts.parser()
                    .verifyWith(getKey(type))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new AccessDeniedException("Access Denied, error: " + e.getMessage());
        }
    }

    private String generateToken(Map<String, Object> claims, String username, TokenType type) {
        log.info("Generate token for subject: {} with claims: {}", username, claims);
        long expiry = type == TokenType.ACCESS_TOKEN ? expiryMinutes : expiryDay * 24 * 60;

        String token = Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiry * 60 * 1000))
                .claims(claims)
                .signWith(getKey(type))
                .compact();

        String redisKey = getRedisPrefix(username, type);
        redisTemplate.opsForValue().set(redisKey, token, expiry, TimeUnit.MINUTES);

        return token;
    }

    private SecretKey getKey(TokenType type) {
        log.info("Getting key for token type: {}", type);
        switch (type) {
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(accessKey));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(refreshKey));
            }
            default -> throw new InvalidDataException("Invalid token type");
        }
    }

    private String getRedisPrefix(String username, TokenType type) {
        log.info("Getting key for redis: {}", type);
        return switch (type) {
            case ACCESS_TOKEN -> "access_token:" + username;
            case REFRESH_TOKEN -> "refresh_token:" + username;
            default -> throw new InvalidDataException("Invalid token type");
        };
    }

}
