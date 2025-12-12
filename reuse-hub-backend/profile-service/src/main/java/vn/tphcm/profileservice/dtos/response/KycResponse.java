package vn.tphcm.profileservice.dtos.response;

import lombok.*;
import vn.tphcm.profileservice.commons.DocumentType;
import vn.tphcm.profileservice.commons.KycStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycResponse {
    private String id;
    private String userId;
    private DocumentType documentType;
    private String documentNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String address;
    private String frontImageUrl;
    private String backImageUrl;
    private String selfieImageUrl;
    private KycStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
