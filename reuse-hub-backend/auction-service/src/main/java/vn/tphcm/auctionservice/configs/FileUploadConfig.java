package vn.tphcm.auctionservice.configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "file.upload")
@Getter
@Setter
public class FileUploadConfig {
    private int maxSize;
    private List<String> allowedTypes;
    private int maxImages;
}
