/*
 * @ (#) UserContextFilter.java       1.0     9/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.filter;
/*
 * @author: Luong Tan Dat
 * @date: 9/2/2025
 */


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.tphcm.profileservice.context.UserContext;
import vn.tphcm.profileservice.context.UserContextHolder;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;


@Component
@Slf4j(topic = "USER-CONTEXT-FILTER")
public class UserContextFilter extends OncePerRequestFilter {
    private static final String[] INTERNAL_PATHS = {
        "/api/v1/profile/internal"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestPath = request.getRequestURI();

        boolean isInternalPath = Arrays.stream(INTERNAL_PATHS)
            .anyMatch(requestPath::startsWith);

        if (isInternalPath) {
            log.info("Skipping user context validation for internal path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        String userId = request.getHeader("X-User-Id");
        String username = request.getHeader("X-User-Username");
        String roles = request.getHeader("X-User-Roles");
        String permissions = request.getHeader("X-User-Permissions");

        if (userId == null || username == null) {
            log.error("Missing user context headers for path: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        UserContext userContext = UserContext.builder()
                .userId(userId)
                .username(username)
                .roles(roles != null ? List.of(roles.split(",")) : List.of())
                .permissions(permissions != null ? List.of(permissions.split(",")) : List.of())
                .build();

        UserContextHolder.setContext(userContext);

        log.debug("User context set: {}", userContext);

        try {
            filterChain.doFilter(request, response);
        } finally {
            UserContextHolder.clear();
            log.debug("User context cleared");
        }
    }
}
