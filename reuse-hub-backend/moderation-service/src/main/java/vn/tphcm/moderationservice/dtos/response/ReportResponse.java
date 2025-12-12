package vn.tphcm.moderationservice.dtos.response;

import lombok.*;
import vn.tphcm.moderationservice.enums.ModerationAction;
import vn.tphcm.moderationservice.enums.ReportStatus;
import vn.tphcm.moderationservice.enums.ReportType;
import vn.tphcm.moderationservice.enums.ReportedEntityType;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private String id;
    private String reporterId;
    private String reportedUserId;
    private ReportedEntityType entityType;
    private String entityId;
    private ReportType reportType;
    private String reason;
    private List<String> evidenceUrls;
    private ReportStatus status;
    private String reviewerId;
    private LocalDateTime reviewedAt;
    private ModerationAction actionTaken;
    private String adminNote;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
