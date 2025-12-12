package vn.tphcm.moderationservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.tphcm.moderationservice.enums.ModerationAction;
import vn.tphcm.moderationservice.enums.ReportStatus;
import vn.tphcm.moderationservice.enums.ReportType;
import vn.tphcm.moderationservice.enums.ReportedEntityType;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_reports", indexes = {
        @Index(name = "idx_report_reporter", columnList = "reporterId"),
        @Index(name = "idx_report_reported_user", columnList = "reportedUserId"),
        @Index(name = "idx_report_status", columnList = "status"),
        @Index(name = "idx_report_entity", columnList = "entityType,entityId")
})
@SuperBuilder
public class Report extends AbstractEntity<String> implements Serializable {

    @Column(name = "reporter_id", nullable = false)
    private String reporterId;

    @Column(name = "reported_user_id")
    private String reportedUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private ReportedEntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> evidenceUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_taken")
    private ModerationAction actionTaken;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
