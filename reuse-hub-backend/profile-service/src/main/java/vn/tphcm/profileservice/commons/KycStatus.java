package vn.tphcm.profileservice.commons;

public enum KycStatus {
    NOT_SUBMITTED,      // Chưa gửi
    PENDING,            // Đang chờ xét duyệt
    UNDER_REVIEW,       // Đang xem xét
    APPROVED,           // Đã xác minh
    REJECTED,           // Bị từ chối
    EXPIRED             // Hết hạn
}
