package vn.tphcm.moderationservice.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import vn.tphcm.moderationservice.enums.ReportType;
import vn.tphcm.moderationservice.enums.ReportedEntityType;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReportRequest {

    @NotNull(message = "Loại đối tượng báo cáo không được để trống")
    private ReportedEntityType entityType;

    @NotBlank(message = "ID đối tượng báo cáo không được để trống")
    private String entityId;

    private String reportedUserId;

    @NotNull(message = "Loại báo cáo không được để trống")
    private ReportType reportType;

    @NotBlank(message = "Lý do báo cáo không được để trống")
    @Size(min = 10, max = 1000, message = "Lý do phải từ 10-1000 ký tự")
    private String reason;

    private List<String> evidenceUrls;
}
