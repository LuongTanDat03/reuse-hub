/*
 * @ (#) RedisConfig.java       1.0     8/16/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.identityservice.configs;
/*
 * @author: Luong Tan Dat
 * @date: 8/16/2025
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@Slf4j(topic = "REDIS-CONFIG")
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        log.info("Initializing RedisTemplate with String and JSON serializers");

        RedisTemplate<String, Object> template = new RedisTemplate<>();

        template.setConnectionFactory(redisConnectionFactory);

        template.setKeySerializer(new StringRedisSerializer());

        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }
}
