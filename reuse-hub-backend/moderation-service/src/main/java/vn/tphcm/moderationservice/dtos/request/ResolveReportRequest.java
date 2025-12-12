package vn.tphcm.moderationservice.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import vn.tphcm.moderationservice.enums.ModerationAction;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveReportRequest {

    @NotNull(message = "Hành động xử lý không được để trống")
    private ModerationAction action;

    private String adminNote;
}
