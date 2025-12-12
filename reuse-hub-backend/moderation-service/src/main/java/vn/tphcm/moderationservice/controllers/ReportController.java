package vn.tphcm.moderationservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.tphcm.moderationservice.dtos.ApiResponse;
import vn.tphcm.moderationservice.dtos.PageResponse;
import vn.tphcm.moderationservice.dtos.request.CreateReportRequest;
import vn.tphcm.moderationservice.dtos.request.ResolveReportRequest;
import vn.tphcm.moderationservice.dtos.response.ReportResponse;
import vn.tphcm.moderationservice.enums.ReportStatus;
import vn.tphcm.moderationservice.services.ReportService;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j(topic = "REPORT-CONTROLLER")
@Tag(name = "Report", description = "Report & Moderation APIs")
public class ReportController {

    private final ReportService reportService;

    // ==================== USER ENDPOINTS ====================

    @PostMapping("/create/{reporterId}")
    @Operation(summary = "Tạo báo cáo mới")
    public ApiResponse<ReportResponse> createReport(
            @PathVariable String reporterId,
            @Valid @RequestBody CreateReportRequest request) {
        log.info("Creating report by user: {}", reporterId);
        return reportService.createReport(reporterId, request);
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Xem chi tiết báo cáo")
    public ApiResponse<ReportResponse> getReportById(@PathVariable String reportId) {
        log.info("Getting report: {}", reportId);
        return reportService.getReportById(reportId);
    }

    @GetMapping("/my-reports/{userId}")
    @Operation(summary = "Xem danh sách báo cáo của tôi")
    public ApiResponse<PageResponse<ReportResponse>> getMyReports(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting reports for user: {}", userId);
        return reportService.getMyReports(userId, pageNo, pageSize);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/pending")
    @Operation(summary = "[Admin] Xem báo cáo chờ xử lý")
    public ApiResponse<PageResponse<ReportResponse>> getPendingReports(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting pending reports");
        return reportService.getPendingReports(pageNo, pageSize);
    }

    @GetMapping("/admin/all")
    @Operation(summary = "[Admin] Xem tất cả báo cáo")
    public ApiResponse<PageResponse<ReportResponse>> getAllReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting all reports with status: {}", status);
        return reportService.getAllReports(status, pageNo, pageSize);
    }

    @GetMapping("/admin/entity/{entityType}/{entityId}")
    @Operation(summary = "[Admin] Xem báo cáo theo đối tượng")
    public ApiResponse<PageResponse<ReportResponse>> getReportsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting reports for entity: {} - {}", entityType, entityId);
        return reportService.getReportsByEntity(entityType, entityId, pageNo, pageSize);
    }

    @GetMapping("/admin/count/pending")
    @Operation(summary = "[Admin] Đếm số báo cáo chờ xử lý")
    public ApiResponse<Long> countPendingReports() {
        return reportService.countPendingReports();
    }

    @PutMapping("/admin/{reportId}/start-review/{adminId}")
    @Operation(summary = "[Admin] Bắt đầu xem xét báo cáo")
    public ApiResponse<ReportResponse> startReview(
            @PathVariable String reportId,
            @PathVariable String adminId) {
        log.info("Starting review for report: {} by admin: {}", reportId, adminId);
        return reportService.startReview(reportId, adminId);
    }

    @PutMapping("/admin/{reportId}/resolve/{adminId}")
    @Operation(summary = "[Admin] Xử lý báo cáo")
    public ApiResponse<ReportResponse> resolveReport(
            @PathVariable String reportId,
            @PathVariable String adminId,
            @Valid @RequestBody ResolveReportRequest request) {
        log.info("Resolving report: {} by admin: {}", reportId, adminId);
        return reportService.resolveReport(reportId, adminId, request);
    }

    @PutMapping("/admin/{reportId}/reject/{adminId}")
    @Operation(summary = "[Admin] Từ chối báo cáo")
    public ApiResponse<ReportResponse> rejectReport(
            @PathVariable String reportId,
            @PathVariable String adminId,
            @RequestParam(required = false, defaultValue = "Không vi phạm") String reason) {
        log.info("Rejecting report: {} by admin: {}", reportId, adminId);
        return reportService.rejectReport(reportId, adminId, reason);
    }
}
