// Report Types
export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';

export type ReportType =
  | 'SPAM'
  | 'FAKE_PRODUCT'
  | 'INAPPROPRIATE_CONTENT'
  | 'FRAUD'
  | 'HARASSMENT'
  | 'COUNTERFEIT'
  | 'PROHIBITED_ITEMS'
  | 'MISLEADING_INFO'
  | 'OTHER';

export type ReportedEntityType = 'ITEM' | 'USER' | 'AUCTION' | 'COMMENT';

export type ModerationAction =
  | 'NO_ACTION'
  | 'WARNING'
  | 'HIDE_CONTENT'
  | 'DELETE_CONTENT'
  | 'BAN_USER_TEMP'
  | 'BAN_USER_PERMANENT'
  | 'REQUIRE_VERIFICATION';

export interface ReportResponse {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  entityType: ReportedEntityType;
  entityId: string;
  reportType: ReportType;
  reason: string;
  evidenceUrls: string[];
  status: ReportStatus;
  reviewerId?: string;
  reviewedAt?: string;
  actionTaken?: ModerationAction;
  adminNote?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportRequest {
  entityType: ReportedEntityType;
  entityId: string;
  reportedUserId?: string;
  reportType: ReportType;
  reason: string;
  evidenceUrls?: string[];
}

export interface ResolveReportRequest {
  action: ModerationAction;
  adminNote?: string;
}

export interface ReportPage {
  content: ReportResponse[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Helper functions
export const getReportTypeLabel = (type: ReportType): string => {
  const labels: Record<ReportType, string> = {
    SPAM: 'Spam',
    FAKE_PRODUCT: 'Hàng giả',
    INAPPROPRIATE_CONTENT: 'Nội dung không phù hợp',
    FRAUD: 'Lừa đảo',
    HARASSMENT: 'Quấy rối',
    COUNTERFEIT: 'Hàng nhái',
    PROHIBITED_ITEMS: 'Hàng cấm',
    MISLEADING_INFO: 'Thông tin sai lệch',
    OTHER: 'Khác',
  };
  return labels[type] || type;
};

export const getReportStatusLabel = (status: ReportStatus): string => {
  const labels: Record<ReportStatus, string> = {
    PENDING: 'Chờ xử lý',
    REVIEWING: 'Đang xem xét',
    RESOLVED: 'Đã xử lý',
    REJECTED: 'Đã từ chối',
  };
  return labels[status] || status;
};

export const getReportStatusColor = (status: ReportStatus): string => {
  const colors: Record<ReportStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getModerationActionLabel = (action: ModerationAction): string => {
  const labels: Record<ModerationAction, string> = {
    NO_ACTION: 'Không hành động',
    WARNING: 'Cảnh báo',
    HIDE_CONTENT: 'Ẩn nội dung',
    DELETE_CONTENT: 'Xóa nội dung',
    BAN_USER_TEMP: 'Khóa tạm thời (7 ngày)',
    BAN_USER_PERMANENT: 'Khóa vĩnh viễn',
    REQUIRE_VERIFICATION: 'Yêu cầu xác minh',
  };
  return labels[action] || action;
};

export const getEntityTypeLabel = (type: ReportedEntityType): string => {
  const labels: Record<ReportedEntityType, string> = {
    ITEM: 'Sản phẩm',
    USER: 'Người dùng',
    AUCTION: 'Đấu giá',
    COMMENT: 'Bình luận',
  };
  return labels[type] || type;
};
