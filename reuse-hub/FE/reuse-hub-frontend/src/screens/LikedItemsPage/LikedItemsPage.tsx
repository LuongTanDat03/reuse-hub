import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as itemsAPI from '../../api/item';
import ItemCard from '../../components/ItemCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const LikedItemsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadLikedItems();
    }
  }, [user?.id, currentPage]);

  const loadLikedItems = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await itemsAPI.getLikedItems(user.id, currentPage, 20);

      if (response.status === 200 && response.data) {
        setItems(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load liked items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeChange = () => {
    // Reload items when like status changes
    loadLikedItems();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold">Sản phẩm đã thích</h1>
              <p className="text-gray-600 mt-1">
                {items.length > 0 ? `${items.length} sản phẩm` : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải..." />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-gray-600 mb-6">
              Khám phá và lưu lại những sản phẩm bạn quan tâm
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onLikeChange={handleLikeChange}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LikedItemsPage;
