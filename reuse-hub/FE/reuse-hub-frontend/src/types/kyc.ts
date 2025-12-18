// KYC Types

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type DocumentType = 'CCCD' | 'CMND' | 'PASSPORT' | 'DRIVER_LICENSE';

export interface KycResponse {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  dateOfBirth?: string;
  address?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  expiresAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycSubmitRequest {
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  dateOfBirth?: string;
  address?: string;
}

export interface KycReviewRequest {
  status: KycStatus;
  rejectionReason?: string;
}

export interface KycPage {
  content: KycResponse[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Helper functions
export const getKycStatusLabel = (status: KycStatus): string => {
  const labels: Record<KycStatus, string> = {
    NOT_SUBMITTED: 'Chưa xác minh',
    PENDING: 'Chờ xét duyệt',
    UNDER_REVIEW: 'Đang xem xét',
    APPROVED: 'Đã xác minh',
    REJECTED: 'Bị từ chối',
    EXPIRED: 'Hết hạn',
  };
  return labels[status] || status;
};

export const getKycStatusColor = (status: KycStatus): string => {
  const colors: Record<KycStatus, string> = {
    NOT_SUBMITTED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getDocumentTypeLabel = (type: DocumentType): string => {
  const labels: Record<DocumentType, string> = {
    CCCD: 'Căn cước công dân',
    CMND: 'Chứng minh nhân dân',
    PASSPORT: 'Hộ chiếu',
    DRIVER_LICENSE: 'Bằng lái xe',
  };
  return labels[type] || type;
};

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'CCCD', label: 'Căn cước công dân' },
  { value: 'CMND', label: 'Chứng minh nhân dân' },
  { value: 'PASSPORT', label: 'Hộ chiếu' },
  { value: 'DRIVER_LICENSE', label: 'Bằng lái xe' },
];
