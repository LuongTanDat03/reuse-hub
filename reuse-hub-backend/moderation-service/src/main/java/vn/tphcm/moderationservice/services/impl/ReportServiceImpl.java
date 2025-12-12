package vn.tphcm.moderationservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tphcm.moderationservice.dtos.ApiResponse;
import vn.tphcm.moderationservice.dtos.PageResponse;
import vn.tphcm.moderationservice.dtos.request.CreateReportRequest;
import vn.tphcm.moderationservice.dtos.request.ResolveReportRequest;
import vn.tphcm.moderationservice.dtos.response.ReportResponse;
import vn.tphcm.moderationservice.enums.ModerationAction;
import vn.tphcm.moderationservice.enums.ReportStatus;
import vn.tphcm.moderationservice.enums.ReportedEntityType;
import vn.tphcm.moderationservice.mapper.ReportMapper;
import vn.tphcm.moderationservice.models.Report;
import vn.tphcm.moderationservice.repositories.ReportRepository;
import vn.tphcm.moderationservice.services.ReportService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "REPORT-SERVICE")
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    @Override
    @Transactional
    public ApiResponse<ReportResponse> createReport(String reporterId, CreateReportRequest request) {
        log.info("Creating report by user: {} for entity: {} - {}", reporterId, request.getEntityType(), request.getEntityId());

        // Check if user already reported this entity
        boolean alreadyReported = reportRepository.existsByReporterIdAndEntityTypeAndEntityIdAndStatusIn(
                reporterId, request.getEntityType(), request.getEntityId(),
                List.of(ReportStatus.PENDING, ReportStatus.REVIEWING));

        if (alreadyReported) {
            return ApiResponse.<ReportResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Bạn đã báo cáo nội dung này rồi. Vui lòng chờ xử lý.")
                    .build();
        }

        Report report = reportMapper.toEntity(request);
        report.setReporterId(reporterId);
        report.setStatus(ReportStatus.PENDING);

        report = reportRepository.save(report);

        log.info("Report created successfully with ID: {}", report.getId());

        return ApiResponse.<ReportResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.")
                .data(reportMapper.toResponse(report))
                .build();
    }

    @Override
    public ApiResponse<ReportResponse> getReportById(String reportId) {
        log.info("Getting report by ID: {}", reportId);

        return reportRepository.findById(reportId)
                .map(report -> ApiResponse.<ReportResponse>builder()
                        .status(HttpStatus.OK.value())
                        .message("Lấy thông tin báo cáo thành công")
                        .data(reportMapper.toResponse(report))
                        .build())
                .orElse(ApiResponse.<ReportResponse>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy báo cáo")
                        .build());
    }

    @Override
    public ApiResponse<PageResponse<ReportResponse>> getMyReports(String userId, int pageNo, int pageSize) {
        log.info("Getting reports by user: {}", userId);

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Report> reportPage = reportRepository.findByReporterId(userId, pageable);

        return buildPageResponse(reportPage, "Lấy danh sách báo cáo thành công");
    }

    @Override
    public ApiResponse<PageResponse<ReportResponse>> getPendingReports(int pageNo, int pageSize) {
        log.info("Getting pending reports");

        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<Report> reportPage = reportRepository.findPendingReportsOrderByCreatedAt(ReportStatus.PENDING, pageable);

        return buildPageResponse(reportPage, "Lấy danh sách báo cáo chờ xử lý thành công");
    }

    @Override
    public ApiResponse<PageResponse<ReportResponse>> getAllReports(ReportStatus status, int pageNo, int pageSize) {
        log.info("Getting all reports with status: {}", status);

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        Page<Report> reportPage;

        if (status != null) {
            reportPage = reportRepository.findByStatus(status, pageable);
        } else {
            reportPage = reportRepository.findAll(pageable);
        }

        return buildPageResponse(reportPage, "Lấy danh sách báo cáo thành công");
    }

    @Override
    public ApiResponse<PageResponse<ReportResponse>> getReportsByEntity(String entityType, String entityId, int pageNo, int pageSize) {
        log.info("Getting reports for entity: {} - {}", entityType, entityId);

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        ReportedEntityType type = ReportedEntityType.valueOf(entityType.toUpperCase());
        Page<Report> reportPage = reportRepository.findByEntityTypeAndEntityId(type, entityId, pageable);

        return buildPageResponse(reportPage, "Lấy danh sách báo cáo thành công");
    }

    @Override
    @Transactional
    public ApiResponse<ReportResponse> resolveReport(String reportId, String adminId, ResolveReportRequest request) {
        log.info("Resolving report: {} by admin: {}", reportId, adminId);

        return reportRepository.findById(reportId)
                .map(report -> {
                    if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.REJECTED) {
                        return ApiResponse.<ReportResponse>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Báo cáo này đã được xử lý")
                                .build();
                    }

                    report.setStatus(ReportStatus.RESOLVED);
                    report.setReviewerId(adminId);
                    report.setReviewedAt(LocalDateTime.now());
                    report.setActionTaken(request.getAction());
                    report.setAdminNote(request.getAdminNote());
                    report.setResolvedAt(LocalDateTime.now());

                    report = reportRepository.save(report);

                    // TODO: Execute action (ban user, hide item, etc.) via message queue

                    log.info("Report {} resolved with action: {}", reportId, request.getAction());

                    return ApiResponse.<ReportResponse>builder()
                            .status(HttpStatus.OK.value())
                            .message("Đã xử lý báo cáo thành công")
                            .data(reportMapper.toResponse(report))
                            .build();
                })
                .orElse(ApiResponse.<ReportResponse>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy báo cáo")
                        .build());
    }

    @Override
    @Transactional
    public ApiResponse<ReportResponse> rejectReport(String reportId, String adminId, String reason) {
        log.info("Rejecting report: {} by admin: {}", reportId, adminId);

        return reportRepository.findById(reportId)
                .map(report -> {
                    if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.REJECTED) {
                        return ApiResponse.<ReportResponse>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Báo cáo này đã được xử lý")
                                .build();
                    }

                    report.setStatus(ReportStatus.REJECTED);
                    report.setReviewerId(adminId);
                    report.setReviewedAt(LocalDateTime.now());
                    report.setActionTaken(ModerationAction.NO_ACTION);
                    report.setAdminNote(reason);
                    report.setResolvedAt(LocalDateTime.now());

                    report = reportRepository.save(report);

                    log.info("Report {} rejected", reportId);

                    return ApiResponse.<ReportResponse>builder()
                            .status(HttpStatus.OK.value())
                            .message("Đã từ chối báo cáo")
                            .data(reportMapper.toResponse(report))
                            .build();
                })
                .orElse(ApiResponse.<ReportResponse>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy báo cáo")
                        .build());
    }

    @Override
    @Transactional
    public ApiResponse<ReportResponse> startReview(String reportId, String adminId) {
        log.info("Starting review for report: {} by admin: {}", reportId, adminId);

        return reportRepository.findById(reportId)
                .map(report -> {
                    if (report.getStatus() != ReportStatus.PENDING) {
                        return ApiResponse.<ReportResponse>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Báo cáo này không ở trạng thái chờ xử lý")
                                .build();
                    }

                    report.setStatus(ReportStatus.REVIEWING);
                    report.setReviewerId(adminId);
                    report.setReviewedAt(LocalDateTime.now());

                    report = reportRepository.save(report);

                    return ApiResponse.<ReportResponse>builder()
                            .status(HttpStatus.OK.value())
                            .message("Đã bắt đầu xem xét báo cáo")
                            .data(reportMapper.toResponse(report))
                            .build();
                })
                .orElse(ApiResponse.<ReportResponse>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy báo cáo")
                        .build());
    }

    @Override
    public ApiResponse<Long> countPendingReports() {
        long count = reportRepository.countByStatus(ReportStatus.PENDING);
        return ApiResponse.<Long>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy số lượng báo cáo chờ xử lý thành công")
                .data(count)
                .build();
    }

    private ApiResponse<PageResponse<ReportResponse>> buildPageResponse(Page<Report> reportPage, String message) {
        PageResponse<ReportResponse> pageResponse = PageResponse.<ReportResponse>builder()
                .content(reportMapper.toResponseList(reportPage.getContent()))
                .pageNo(reportPage.getNumber())
                .pageSize(reportPage.getSize())
                .totalElements(reportPage.getTotalElements())
                .totalPages(reportPage.getTotalPages())
                .last(reportPage.isLast())
                .build();

        return ApiResponse.<PageResponse<ReportResponse>>builder()
                .status(HttpStatus.OK.value())
                .message(message)
                .data(pageResponse)
                .build();
    }
}
