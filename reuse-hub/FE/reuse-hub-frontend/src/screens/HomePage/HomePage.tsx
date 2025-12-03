import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as itemsAPI from '../../api/items';
import * as recommendationAPI from '../../api/recommendation';
import ItemCard from '../../components/ItemCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load trending items
      const trendingResponse = await recommendationAPI.getTrendingItems(8, 'week');
      if (trendingResponse.status === 200) {
        setTrendingItems(trendingResponse.data || []);
      }

      // Load new arrivals
      const newResponse = await recommendationAPI.getNewArrivals(8);
      if (newResponse.status === 200) {
        setNewArrivals(newResponse.data || []);
      }

      // Load personalized recommendations if user is logged in
      if (user?.id) {
        const recResponse = await recommendationAPI.getPersonalizedRecommendations(user.id, 8);
        if (recResponse.status === 200) {
          setRecommendations(recResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { id: 'ELECTRONICS', name: 'Điện tử', icon: '💻' },
    { id: 'FASHION', name: 'Thời trang', icon: '👕' },
    { id: 'HOME', name: 'Đồ gia dụng', icon: '🏠' },
    { id: 'BOOKS', name: 'Sách', icon: '📚' },
    { id: 'SPORTS', name: 'Thể thao', icon: '⚽' },
    { id: 'TOYS', name: 'Đồ chơi', icon: '🧸' },
    { id: 'BEAUTY', name: 'Làm đẹp', icon: '💄' },
    { id: 'OTHER', name: 'Khác', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Chào mừng đến ReuseHub
            </h1>
            <p className="text-xl mb-8">
              Nền tảng mua bán đồ cũ uy tín, tiện lợi và thân thiện với môi trường
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-lg transition-colors"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                className="flex flex-col items-center p-6 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="text-4xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {user && recommendations.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Đề xuất cho bạn</h2>
              <button
                onClick={() => navigate('/recommendations')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Items */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Đang thịnh hành 🔥</h2>
            <button
              onClick={() => navigate('/trending')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Sản phẩm mới ✨</h2>
            <button
              onClick={() => navigate('/new-arrivals')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Bạn có đồ cũ muốn bán?</h2>
          <p className="text-xl mb-8">
            Đăng tin miễn phí và tiếp cận hàng ngàn người mua tiềm năng
          </p>
          <button
            onClick={() => navigate(user ? '/post-create' : '/login')}
            className="px-8 py-4 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-semibold text-lg transition-colors"
          >
            Đăng tin ngay
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn ReuseHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">An toàn & Bảo mật</h3>
              <p className="text-gray-600">
                Hệ thống xác thực người dùng và thanh toán an toàn qua Stripe
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Chat trực tiếp</h3>
              <p className="text-gray-600">
                Trao đổi nhanh chóng với người mua/bán qua hệ thống chat
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-2">Thân thiện môi trường</h3>
              <p className="text-gray-600">
                Góp phần giảm rác thải và bảo vệ môi trường
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
