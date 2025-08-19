/*
 * @ (#) CustomerRequestFilter.java       1.0     8/13/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.reusehubbackend.configs;
/*
 * @author: Luong Tan Dat
 * @date: 8/13/2025
 */

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.tphcm.reusehubbackend.commons.TokenType;
import vn.tphcm.reusehubbackend.services.JwtService;
import vn.tphcm.reusehubbackend.services.UserServiceDetail;

import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@Component
@RequiredArgsConstructor
@Slf4j(topic = "CUSTOMER-REQUEST-FILTER")
public class CustomerRequestFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserServiceDetail userServiceDetail;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("{} - {}", request.getMethod(), request.getRequestURI());

        String authHeader = request.getHeader(AUTHORIZATION);
        if (StringUtils.hasLength(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            log.info("Bearer authHeader: {}", token.substring(0, 20));

            String username = "";
            username = jwtService.extractUsername(token, TokenType.ACCESS_TOKEN);

            log.info("Username: {}", username);

            UserDetails userDetails = userServiceDetail.userDetailsService().loadUserByUsername(username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null && userDetails == null) {
                    log.error("User not found");
                    sendErrorResponse(response);
                    return;
                }

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            securityContext.setAuthentication(authenticationToken);
            SecurityContextHolder.setContext(securityContext);

            filterChain.doFilter(request, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }


    private void sendErrorResponse(HttpServletResponse response)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String jsonResponse = String.format("{\"error\": \"%s\"}", "User not found");
        response.getWriter().write(jsonResponse);
    }

}
