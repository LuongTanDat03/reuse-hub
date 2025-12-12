package vn.tphcm.auctionservice.commons;

public enum BidStatus {
    ACTIVE,       // Đang là giá cao nhất
    OUTBID,       // Đã bị vượt qua
    WON,          // Thắng đấu giá
    CANCELLED     // Đã hủy
}
