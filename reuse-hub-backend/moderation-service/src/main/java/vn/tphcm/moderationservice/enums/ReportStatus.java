package vn.tphcm.moderationservice.enums;

public enum ReportStatus {
    PENDING,      // Chờ xử lý
    REVIEWING,    // Đang xem xét
    RESOLVED,     // Đã xử lý
    REJECTED      // Từ chối (không vi phạm)
}
