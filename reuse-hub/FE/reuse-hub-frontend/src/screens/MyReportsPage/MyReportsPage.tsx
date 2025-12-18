import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { getMyReports } from '../../api/report';
import {
  ReportResponse,
  getReportTypeLabel,
  getReportStatusLabel,
  getReportStatusColor,
  getEntityTypeLabel,
  getModerationActionLabel,
} from '../../types/report';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = async (reset = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const response = await getMyReports(user.id, currentPage, 10);

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
    if (user) {
      fetchReports(true);
    }
  }, [user]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">📋 Báo cáo của tôi</h1>
            <p className="text-gray-600">Theo dõi trạng thái các báo cáo bạn đã gửi</p>
          </div>

          {/* Reports List */}
          {loading && reports.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg mb-4">Bạn chưa gửi báo cáo nào</p>
              <p className="text-sm text-gray-400">
                Nếu phát hiện nội dung vi phạm, hãy sử dụng nút "Báo cáo" trên sản phẩm hoặc trang cá nhân
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getReportStatusColor(report.status)}`}>
                        {getReportStatusLabel(report.status)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {getEntityTypeLabel(report.entityType)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">
                    {getReportTypeLabel(report.reportType)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{report.reason}</p>

                  {report.status === 'RESOLVED' && report.actionTaken && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Kết quả xử lý:</span>{' '}
                        {getModerationActionLabel(report.actionTaken)}
                      </p>
                      {report.adminNote && (
                        <p className="text-sm text-green-700 mt-1">
                          <span className="font-medium">Ghi chú:</span> {report.adminNote}
                        </p>
                      )}
                    </div>
                  )}

                  {report.status === 'REJECTED' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Kết quả:</span> Báo cáo không được chấp nhận
                      </p>
                      {report.adminNote && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Lý do:</span> {report.adminNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyReportsPage;
