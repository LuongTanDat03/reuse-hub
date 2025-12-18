import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { getAllKyc, reviewKyc, countPendingKyc } from '../../api/kyc';
import {
  KycResponse,
  KycStatus,
  getKycStatusLabel,
  getKycStatusColor,
  getDocumentTypeLabel,
} from '../../types/kyc';
import { Shield, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const KYC_STATUSES: { value: KycStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'UNDER_REVIEW', label: 'Đang xem xét' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
];

export const KycManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [kycList, setKycList] = useState<KycResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<KycStatus | ''>('');
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [selectedKyc, setSelectedKyc] = useState<KycResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadKycList();
    loadPendingCount();
  }, [statusFilter, pageNo]);

  const loadKycList = async () => {
    setLoading(true);
    try {
      const response = statusFilter
        ? await getAllKyc(statusFilter, pageNo, 10)
        : await getAllKyc(undefined, pageNo, 10);

      if (response.status === 200 && response.data) {
        setKycList(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Error loading KYC list:', error);
      toast.error('Không thể tải danh sách KYC');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const response = await countPendingKyc();
      if (response.status === 200) {
        setPendingCount(response.data || 0);
      }
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const handleReview = async (status: KycStatus) => {
    if (!selectedKyc || !user) return;

    if (status === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setReviewing(true);
    try {
      const response = await reviewKyc(selectedKyc.id, user.id, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });

      if (response.status === 200) {
        toast.success(response.message || 'Xét duyệt thành công');
        setShowModal(false);
        setSelectedKyc(null);
        setRejectionReason('');
        loadKycList();
        loadPendingCount();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setReviewing(false);
    }
  };

  const openModal = (kyc: KycResponse) => {
    setSelectedKyc(kyc);
    setShowModal(true);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#214d8c]" />
          <h2 className="text-xl font-bold text-gray-900">Quản lý KYC</h2>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingCount} chờ duyệt
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as KycStatus | '');
            setPageNo(0);
          }}
          className="h-10 rounded-md border px-3 text-sm bg-white"
        >
          {KYC_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          Tổng: {totalElements} yêu cầu
        </span>
      </div>

      {/* KYC List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214d8c]" />
        </div>
      ) : kycList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Không có yêu cầu KYC nào
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại giấy tờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số giấy tờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày gửi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycList.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{kyc.fullName}</div>
                      <div className="text-sm text-gray-500">{kyc.userId.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDocumentTypeLabel(kyc.documentType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kyc.documentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getKycStatusColor(kyc.status)}`}>
                      {getKycStatusLabel(kyc.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {kyc.submittedAt
                      ? new Date(kyc.submittedAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(kyc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            disabled={pageNo === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Trang {pageNo + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageNo >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Chi tiết KYC</h3>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">Họ tên:</span>
                  <p className="font-medium">{selectedKyc.fullName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">User ID:</span>
                  <p className="font-medium text-sm">{selectedKyc.userId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Loại giấy tờ:</span>
                  <p className="font-medium">{getDocumentTypeLabel(selectedKyc.documentType)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Số giấy tờ:</span>
                  <p className="font-medium">{selectedKyc.documentNumber}</p>
                </div>
                {selectedKyc.dateOfBirth && (
                  <div>
                    <span className="text-sm text-gray-500">Ngày sinh:</span>
                    <p className="font-medium">{selectedKyc.dateOfBirth}</p>
                  </div>
                )}
                {selectedKyc.address && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">Địa chỉ:</span>
                    <p className="font-medium">{selectedKyc.address}</p>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Hình ảnh giấy tờ:</h4>
                <div className="grid grid-cols-3 gap-4">
                  {selectedKyc.frontImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mặt trước</p>
                      <img
                        src={selectedKyc.frontImageUrl}
                        alt="Front"
                        className="w-full h-40 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(selectedKyc.frontImageUrl, '_blank')}
                      />
                    </div>
                  )}
                  {selectedKyc.backImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mặt sau</p>
                      <img
                        src={selectedKyc.backImageUrl}
                        alt="Back"
                        className="w-full h-40 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(selectedKyc.backImageUrl, '_blank')}
                      />
                    </div>
                  )}
                  {selectedKyc.selfieImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Selfie</p>
                      <img
                        src={selectedKyc.selfieImageUrl}
                        alt="Selfie"
                        className="w-full h-40 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(selectedKyc.selfieImageUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <span className="text-sm text-gray-500">Trạng thái hiện tại:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getKycStatusColor(selectedKyc.status)}`}>
                  {getKycStatusLabel(selectedKyc.status)}
                </span>
              </div>

              {/* Review Actions */}
              {(selectedKyc.status === 'PENDING' || selectedKyc.status === 'UNDER_REVIEW') && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Xét duyệt:</h4>

                  {/* Rejection Reason */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-500">Lý do từ chối (nếu từ chối):</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối..."
                      className="w-full border rounded-md p-2 mt-1 text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReview('APPROVED')}
                      disabled={reviewing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Phê duyệt
                    </Button>
                    <Button
                      onClick={() => handleReview('REJECTED')}
                      disabled={reviewing}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycManagementPage;
