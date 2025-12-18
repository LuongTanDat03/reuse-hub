import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { createReport } from '../../api/report';
import {
  ReportType,
  ReportedEntityType,
  getReportTypeLabel,
} from '../../types/report';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: ReportedEntityType;
  entityId: string;
  reportedUserId?: string;
  entityTitle?: string;
}

const REPORT_TYPES: ReportType[] = [
  'SPAM',
  'FAKE_PRODUCT',
  'INAPPROPRIATE_CONTENT',
  'FRAUD',
  'HARASSMENT',
  'COUNTERFEIT',
  'PROHIBITED_ITEMS',
  'MISLEADING_INFO',
  'OTHER',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  reportedUserId,
  entityTitle,
}) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return;
    }

    if (!reportType) {
      toast.error('Vui lòng chọn loại vi phạm');
      return;
    }

    if (reason.length < 10) {
      toast.error('Lý do phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    try {
      const response = await createReport(user.id, {
        entityType,
        entityId,
        reportedUserId,
        reportType,
        reason,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success(response.message || 'Báo cáo đã được gửi thành công');
        onClose();
        setReportType('');
        setReason('');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold mb-4">🚨 Báo cáo vi phạm</h2>

        {entityTitle && (
          <p className="text-sm text-gray-600 mb-4">
            Báo cáo: <span className="font-medium">{entityTitle}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Loại vi phạm *</Label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full h-10 rounded-md border px-3 text-sm bg-white"
              disabled={loading}
            >
              <option value="">-- Chọn loại vi phạm --</option>
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getReportTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Mô tả chi tiết *</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả chi tiết về vi phạm (tối thiểu 10 ký tự)"
              className="w-full border rounded-md p-3 min-h-[120px] text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">{reason.length}/1000 ký tự</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !reportType || reason.length < 10}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
