package vn.tphcm.auctionservice.commons;

public enum AuctionStatus {
    PENDING,      // Chờ bắt đầu
    ACTIVE,       // Đang diễn ra
    ENDED,        // Đã kết thúc
    SOLD,         // Đã bán
    CANCELLED,    // Đã hủy
    NO_BIDS       // Kết thúc không có ai đấu giá
}
