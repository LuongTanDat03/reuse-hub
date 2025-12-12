package vn.tphcm.moderationservice.enums;

public enum ModerationAction {
    NO_ACTION,              // Không hành động
    WARNING,                // Cảnh báo
    HIDE_CONTENT,          // Ẩn nội dung
    DELETE_CONTENT,        // Xóa nội dung
    BAN_USER_TEMP,         // Khóa tài khoản tạm thời (7 ngày)
    BAN_USER_PERMANENT,    // Khóa tài khoản vĩnh viễn
    REQUIRE_VERIFICATION   // Yêu cầu xác minh
}
