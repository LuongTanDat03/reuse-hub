package vn.tphcm.moderationservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.moderationservice.enums.ReportStatus;
import vn.tphcm.moderationservice.enums.ReportedEntityType;
import vn.tphcm.moderationservice.models.Report;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {

    Page<Report> findByReporterId(String reporterId, Pageable pageable);

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByStatusIn(List<ReportStatus> statuses, Pageable pageable);

    Page<Report> findByEntityTypeAndEntityId(ReportedEntityType entityType, String entityId, Pageable pageable);

    Page<Report> findByReportedUserId(String reportedUserId, Pageable pageable);

    long countByStatus(ReportStatus status);

    long countByReportedUserIdAndStatus(String reportedUserId, ReportStatus status);

    boolean existsByReporterIdAndEntityTypeAndEntityIdAndStatusIn(
            String reporterId, ReportedEntityType entityType, String entityId, List<ReportStatus> statuses);

    @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.createdAt ASC")
    Page<Report> findPendingReportsOrderByCreatedAt(@Param("status") ReportStatus status, Pageable pageable);

    @Query("SELECT r.reportedUserId, COUNT(r) as reportCount FROM Report r " +
           "WHERE r.status = 'RESOLVED' GROUP BY r.reportedUserId ORDER BY reportCount DESC")
    List<Object[]> findMostReportedUsers(Pageable pageable);
}
