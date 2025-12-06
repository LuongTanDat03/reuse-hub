/*
 * @ (#) JwtAuthenticationFilter.java       1.0     12/4/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.adminservice.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Get user info from headers (set by API Gateway)
        String userId = request.getHeader("X-User-Id");
        String username = request.getHeader("X-Username");
        String rolesHeader = request.getHeader("X-Roles");

        log.debug("JWT Filter - userId: {}, username: {}, roles: {}", userId, username, rolesHeader);

        if (userId != null && username != null && rolesHeader != null) {
            try {
                // Parse roles from header
                List<String> roles = objectMapper.readValue(rolesHeader, List.class);
                
                // Convert to Spring Security authorities with ROLE_ prefix
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

                log.debug("Parsed authorities: {}", authorities);

                // Create authentication token
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.info("User {} authenticated with roles: {}", username, roles);
            } catch (Exception e) {
                log.error("Error parsing roles from header: {}", e.getMessage());
            }
        } else {
            log.warn("Missing authentication headers - userId: {}, username: {}, roles: {}", 
                    userId, username, rolesHeader);
        }

        filterChain.doFilter(request, response);
    }
}
