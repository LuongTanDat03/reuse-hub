package vn.tphcm.profileservice.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import vn.tphcm.profileservice.commons.KycStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycReviewRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private KycStatus status;

    private String rejectionReason;
}
