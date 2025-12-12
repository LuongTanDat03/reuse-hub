package vn.tphcm.auctionservice.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration - CORS is handled by API Gateway
 * This config ensures no duplicate CORS headers are added
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Empty - CORS is handled by API Gateway
        // Do not add any CORS configuration here to avoid duplicate headers
    }
}
