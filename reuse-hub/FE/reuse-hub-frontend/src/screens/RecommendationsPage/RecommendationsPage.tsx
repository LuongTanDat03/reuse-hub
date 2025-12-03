import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as recommendationAPI from '../../api/recommendation';
import ItemCard from '../../components/ItemCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'new'>('personalized');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [activeTab, user?.id]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'personalized':
          if (user?.id) {
            response = await recommendationAPI.getPersonalizedRecommendations(user.id, 20);
          } else {
            response = await recommendationAPI.getTrendingItems(20, 'week');
          }
          break;
        case 'trending':
          response = await recommendationAPI.getTrendingItems(20, 'week');
          break;
        case 'new':
          response = await recommendationAPI.getNewArrivals(20);
          break;
      }

      if (response && response.status === 200 && response.data) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personalized' as const, label: 'Dành cho bạn', icon: '✨' },
    { id: 'trending' as const, label: 'Thịnh hành', icon: '🔥' },
    { id: 'new' as const, label: 'Mới nhất', icon: '🆕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Đề xuất cho bạn</h1>
          <p className="text-gray-600">
            Khám phá những sản phẩm phù hợp với sở thích của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải đề xuất..." />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Không có đề xuất</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'personalized'
                ? 'Hãy khám phá và tương tác với các sản phẩm để nhận được đề xuất phù hợp'
                : 'Hiện tại chưa có sản phẩm nào'}
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
            {/* Info Banner */}
            {activeTab === 'personalized' && user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Đề xuất cá nhân hóa</h4>
                    <p className="text-sm text-blue-700">
                      Các sản phẩm này được chọn dựa trên lịch sử xem, sở thích và hành vi của bạn
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trending' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Đang thịnh hành</h4>
                    <p className="text-sm text-orange-700">
                      Những sản phẩm được nhiều người quan tâm nhất trong tuần này
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'new' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🆕</span>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Sản phẩm mới</h4>
                    <p className="text-sm text-green-700">
                      Những sản phẩm mới được đăng gần đây
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load More */}
            {items.length >= 20 && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadRecommendations}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </>
        )}

        {/* Categories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Khám phá theo danh mục</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'ELECTRONICS', name: 'Điện tử', icon: '💻' },
              { id: 'FASHION', name: 'Thời trang', icon: '👕' },
              { id: 'HOME', name: 'Đồ gia dụng', icon: '🏠' },
              { id: 'BOOKS', name: 'Sách', icon: '📚' },
              { id: 'SPORTS', name: 'Thể thao', icon: '⚽' },
              { id: 'TOYS', name: 'Đồ chơi', icon: '🧸' },
              { id: 'BEAUTY', name: 'Làm đẹp', icon: '💄' },
              { id: 'OTHER', name: 'Khác', icon: '�'  },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => window.location.href = `/category/${category.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
              >
                <span className="text-4xl mb-2 block">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
