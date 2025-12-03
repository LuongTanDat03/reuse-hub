/*
 * @ (#) AuthenticationRequestInterceptor.java       1.0     9/5/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.transactionservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 9/5/2025
 */

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Slf4j(topic = "AUTHENTICATION-REQUEST-INTERCEPTOR")
public class AuthenticationRequestInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getCredentials() != null) {
            String token = authentication.getCredentials().toString();
            if (StringUtils.hasText(token)) {
                log.info("Adding Authorization header to outgoing request");
                template.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            }
        } else {
            log.warn("No authentication information found in SecurityContext");
        }
    }
}
