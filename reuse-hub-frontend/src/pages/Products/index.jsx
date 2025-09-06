import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import { useProducts } from '../../hooks/useProducts';

const Products = () => {
  const { products, categories, loading, error } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on active category and search term
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.product_category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, activeCategory, searchTerm]);

  // Get category icon based on category name
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Sản phẩm in ấn': '📄',
      'Dịch vụ/Cấu hình': '⚙️',
      'In ấn quảng cáo': '📢',
      'Văn phòng phẩm': '📋',
      'Quà tặng': '🎁',
    };
    return iconMap[category] || '📦';
  };

  if (loading) return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Đang tải danh sách sản phẩm...</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="text-center p-10">
        <div className="text-red-500 mb-6">
          <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            🔄 Thử lại
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="text-white py-16" style={{ backgroundColor: '#28367D' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <nav className="mb-6">
            <ol className="flex items-center justify-center space-x-2 text-blue-100">
              <li><Link to="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><span className="text-blue-300">/</span></li>
              <li className="font-medium" style={{ color: '#B4D334' }}>Sản phẩm</li>
            </ol>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Sản phẩm</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Khám phá bộ sưu tập đa dạng các sản phẩm in ấn chất lượng cao với giá cả cạnh tranh
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Stats */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-lg font-semibold text-gray-900">
                {filteredProducts.length} sản phẩm
                {activeCategory !== 'all' && (
                  <span className="text-blue-600"> trong "{activeCategory}"</span>
                )}
              </p>
              <p className="text-sm text-gray-500">Tổng cộng {products.length} sản phẩm</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
                Danh mục sản phẩm
              </h2>
              
              <div className="space-y-2">
                {/* "All" button */}
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeCategory === 'all'
                      ? 'border-2 font-semibold'
                      : 'border-2 border-transparent hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: activeCategory === 'all' ? '#2D418D' : '#f9fafb',
                    borderColor: activeCategory === 'all' ? '#B4D334' : 'transparent',
                    color: activeCategory === 'all' ? '#B4D334' : '#374151'
                  }}
                >
                  <div className="flex items-center">
                    <div className="mr-3 w-5 h-5 grid grid-cols-2 gap-0.5">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#B4D334' }}></div>
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#B4D334' }}></div>
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#B4D334' }}></div>
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#B4D334' }}></div>
                    </div>
                    <span>Tất cả sản phẩm</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                    style={{
                      backgroundColor: activeCategory === 'all' ? '#B4D334' : '#e5e7eb',
                      color: activeCategory === 'all' ? '#2D418D' : '#6b7280'
                    }}>
                    {products.length}
                  </span>
                </button>

                {/* Category buttons */}
                {categories.map(category => {
                  const categoryCount = products.filter(p => p.product_category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeCategory === category
                          ? 'border-2 font-semibold'
                          : 'border-2 border-transparent hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: activeCategory === category ? '#2D418D' : '#f9fafb',
                        borderColor: activeCategory === category ? '#B4D334' : 'transparent',
                        color: activeCategory === category ? '#B4D334' : '#374151'
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getCategoryIcon(category)}</span>
                        <span className="text-left">{category}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: activeCategory === category ? '#B4D334' : '#e5e7eb',
                          color: activeCategory === category ? '#2D418D' : '#6b7280'
                        }}>
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contact info in sidebar */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Cần hỗ trợ?
                </h3>
                <p className="text-sm text-blue-800 mb-3">Liên hệ để được tư vấn miễn phí</p>
                <Button size="small" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white">
                  📞 Gọi ngay
                </Button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <section className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-6">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.213-2.172m12.426 0a9 9 0 11-12.426 0" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? `Không có sản phẩm nào phù hợp với từ khóa "${searchTerm}"`
                      : 'Không có sản phẩm nào trong danh mục này'
                    }
                  </p>
                  {(searchTerm || activeCategory !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory('all');
                      }}
                    >
                      🔄 Xem tất cả sản phẩm
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link to={`/products/${product.id}`} key={product.id} className="group">
                    <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer shadow-lg hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20" style={{ border: '2px solid #B4D334', background: 'radial-gradient(ellipse at center, #E9F9A5 0%, rgba(173,244,110,0.22) 77%, rgba(70,122,19,0) 100%)' }}>
                      <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                        {product.img_url ? (
                          <img 
                            src={product.img_url} 
                            alt={product.product_name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="absolute top-3/4 left-2 right-2 text-center">
                        <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5 line-clamp-2">{product.product_name}</h3>
                        <p className="text-[#B4D334] text-xs sm:text-sm font-bold">{product.price ? product.price + '₫' : ''}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products; 