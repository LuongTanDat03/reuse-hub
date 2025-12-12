package vn.tphcm.moderationservice.services;

import vn.tphcm.moderationservice.dtos.ApiResponse;
import vn.tphcm.moderationservice.dtos.PageResponse;
import vn.tphcm.moderationservice.dtos.request.CreateReportRequest;
import vn.tphcm.moderationservice.dtos.request.ResolveReportRequest;
import vn.tphcm.moderationservice.dtos.response.ReportResponse;
import vn.tphcm.moderationservice.enums.ReportStatus;

public interface ReportService {

    ApiResponse<ReportResponse> createReport(String reporterId, CreateReportRequest request);

    ApiResponse<ReportResponse> getReportById(String reportId);

    ApiResponse<PageResponse<ReportResponse>> getMyReports(String userId, int pageNo, int pageSize);

    ApiResponse<PageResponse<ReportResponse>> getPendingReports(int pageNo, int pageSize);

    ApiResponse<PageResponse<ReportResponse>> getAllReports(ReportStatus status, int pageNo, int pageSize);

    ApiResponse<PageResponse<ReportResponse>> getReportsByEntity(String entityType, String entityId, int pageNo, int pageSize);

    ApiResponse<ReportResponse> resolveReport(String reportId, String adminId, ResolveReportRequest request);

    ApiResponse<ReportResponse> rejectReport(String reportId, String adminId, String reason);

    ApiResponse<ReportResponse> startReview(String reportId, String adminId);

    ApiResponse<Long> countPendingReports();
}
