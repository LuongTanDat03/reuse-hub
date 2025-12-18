import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPendingReports,
  getAllReports,
  resolveReport,
  rejectReport,
  startReview,
} from '../../api/report';
import {
  ReportResponse,
  ReportStatus,
  ModerationAction,
  getReportTypeLabel,
  getReportStatusLabel,
  getReportStatusColor,
  getModerationActionLabel,
  getEntityTypeLabel,
} from '../../types/report';

type TabType = 'pending' | 'reviewing' | 'resolved' | 'rejected' | 'all';

const MODERATION_ACTIONS: ModerationAction[] = [
  'WARNING',
  'HIDE_CONTENT',
  'DELETE_CONTENT',
  'BAN_USER_TEMP',
  'BAN_USER_PERMANENT',
];

export const ModerationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [actionModal, setActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ModerationAction>('WARNING');
  const [adminNote, setAdminNote] = useState('');

  const fetchReports = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      let response;

      if (activeTab === 'pending') {
        response = await getPendingReports(currentPage, 10);
      } else if (activeTab === 'all') {
        response = await getAllReports(undefined, currentPage, 10);
      } else {
        const statusMap: Record<string, ReportStatus> = {
          reviewing: 'REVIEWING',
          resolved: 'RESOLVED',
          rejected: 'REJECTED',
        };
        response = await getAllReports(statusMap[activeTab], currentPage, 10);
      }

      if (response.status === 200 && response.data) {
        const newReports = response.data.content;
        setReports(reset ? newReports : [...reports, ...newReports]);
        setHasMore(!response.data.last);
        if (reset) setPage(0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(true);
  }, [activeTab]);

  const handleStartReview = async (report: ReportResponse) => {
    if (!user) return;
    try {
      const response = await startReview(report.id, user.id);
      if (response.status === 200) {
        toast.success('Đã bắt đầu xem xét báo cáo');
        fetchReports(true);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleResolve = async () => {
    if (!user || !selectedReport) return;
    try {
      const response = await resolveReport(selectedReport.id, user.id, {
        action: selectedAction,
        adminNote,
      });
      if (response.status === 200) {
        toast.success('Đã xử lý báo cáo thành công');
        setActionModal(false);
        setSelectedReport(null);
        setAdminNote('');
        fetchReports(true);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleReject = async (report: ReportResponse) => {
    if (!user) return;
    try {
      const response = await rejectReport(report.id, user.id, 'Không vi phạm');
      if (response.status === 200) {
        toast.success('Đã từ chối báo cáo');
        fetchReports(true);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const openActionModal = (report: ReportResponse) => {
    setSelectedReport(report);
    setActionModal(true);
  };

  return (
    <>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">🛡️ Quản lý báo cáo</h1>
            <p className="text-gray-600">Xem xét và xử lý các báo cáo vi phạm</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'pending', label: '⏳ Chờ xử lý' },
              { key: 'reviewing', label: '👁️ Đang xem xét' },
              { key: 'resolved', label: '✅ Đã xử lý' },
              { key: 'rejected', label: '❌ Đã từ chối' },
              { key: 'all', label: '📋 Tất cả' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as TabType);
                  setReports([]);
                }}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#214d8c] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại vi phạm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đối tượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không có báo cáo nào
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{getReportTypeLabel(report.reportType)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {getEntityTypeLabel(report.entityType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-xs" title={report.reason}>
                          {report.reason}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getReportStatusColor(report.status)}`}>
                          {getReportStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {report.status === 'PENDING' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartReview(report)}
                            >
                              Xem xét
                            </Button>
                          </div>
                        )}
                        {report.status === 'REVIEWING' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openActionModal(report)}
                            >
                              Xử lý
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(report)}
                            >
                              Từ chối
                            </Button>
                          </div>
                        )}
                        {(report.status === 'RESOLVED' || report.status === 'REJECTED') && report.actionTaken && (
                          <span className="text-sm text-gray-500">
                            {getModerationActionLabel(report.actionTaken)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && reports.length > 0 && (
            <div className="text-center mt-6">
              <Button
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchReports();
                }}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Đang tải...' : 'Xem thêm'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActionModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">⚖️ Xử lý báo cáo</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hành động xử lý</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as ModerationAction)}
                  className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                >
                  {MODERATION_ACTIONS.map((action) => (
                    <option key={action} value={action}>
                      {getModerationActionLabel(action)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ghi chú cho người dùng..."
                  className="w-full border rounded-md p-3 min-h-[80px] text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActionModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleResolve}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModerationPage;
