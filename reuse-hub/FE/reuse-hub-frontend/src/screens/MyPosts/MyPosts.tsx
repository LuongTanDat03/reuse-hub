import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyItems, deleteItem, formatPrice } from '../../api/item';
import { ItemSummaryResponse, Page } from '../../types/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.id) {
      loadItems(0);
    }
  }, [user?.id]);

  const loadItems = async (page: number) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getMyItems(user.id, page, 12, 'createdAt', 'desc');
      const data = res.data as unknown as Page<ItemSummaryResponse>;
      setItems(data?.content || []);
      setPageNo(data?.pageNumber || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (e) {
      console.error('Failed to load my items', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user?.id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa tin này?')) return;
    setDeleting(prev => ({ ...prev, [itemId]: true }));
    try {
      await deleteItem(user.id, itemId);
      await loadItems(pageNo);
    } catch (e) {
      console.error('Delete failed', e);
    } finally {
      setDeleting(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Vui lòng đăng nhập để xem tin đã đăng</p>
          <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tin đã đăng</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">Bạn chưa có tin đăng nào</p>
            <Button className="mt-4" onClick={() => navigate('/dang-tin')}>Đăng tin ngay</Button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <img
                    src={item.images?.[0] || '/placeholder-image.png'}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-red-600 font-bold mt-1">{formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.status} • {item.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Button variant="outline" onClick={() => navigate(`/product/${item.id}`)}>Xem</Button>
                      <div className="flex gap-2">
                        {/* Có thể làm trang sửa sau, tạm ẩn nút sửa */}
                        {/* <Button variant="secondary" onClick={() => navigate(`/sua-tin/${item.id}`)}>Sửa</Button> */}
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                          disabled={!!deleting[item.id]}
                        >
                          {deleting[item.id] ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" onClick={() => loadItems(Math.max(0, pageNo - 1))} disabled={pageNo === 0}>Trước</Button>
                <span className="px-4 py-2 text-sm text-gray-600">Trang {pageNo + 1} / {totalPages}</span>
                <Button variant="outline" onClick={() => loadItems(Math.min(totalPages - 1, pageNo + 1))} disabled={pageNo >= totalPages - 1}>Sau</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;

