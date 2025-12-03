import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as itemsAPI from '../../api/items';
import ItemCard from '../../components/ItemCard';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDirection: searchParams.get('sortDirection') || 'DESC',
  });

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'ELECTRONICS', label: 'Điện tử' },
    { value: 'FASHION', label: 'Thời trang' },
    { value: 'HOME', label: 'Đồ gia dụng' },
    { value: 'BOOKS', label: 'Sách' },
    { value: 'SPORTS', label: 'Thể thao' },
    { value: 'TOYS', label: 'Đồ chơi' },
    { value: 'BEAUTY', label: 'Làm đẹp' },
    { value: 'OTHER', label: 'Khác' },
  ];

  const conditions = [
    { value: '', label: 'Tất cả' },
    { value: 'NEW', label: 'Mới' },
    { value: 'LIKE_NEW', label: 'Như mới' },
    { value: 'GOOD', label: 'Tốt' },
    { value: 'FAIR', label: 'Khá' },
    { value: 'POOR', label: 'Cũ' },
  ];

  const sortOptions = [
    { value: 'createdAt-DESC', label: 'Mới nhất' },
    { value: 'createdAt-ASC', label: 'Cũ nhất' },
    { value: 'price-ASC', label: 'Giá thấp đến cao' },
    { value: 'price-DESC', label: 'Giá cao đến thấp' },
    { value: 'title-ASC', label: 'Tên A-Z' },
  ];

  useEffect(() => {
    performSearch();
  }, [searchParams, currentPage]);

  const performSearch = async () => {
    try {
      setLoading(true);

      const searchRequest = {
        keyword: filters.keyword,
        category: filters.category || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        condition: filters.condition || undefined,
        location: filters.location || undefined,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection as 'ASC' | 'DESC',
        page: currentPage,
        size: 20,
      };

      const response = await itemsAPI.searchItems(searchRequest);
      
      if (response.status === 200 && response.data) {
        setItems(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
    setCurrentPage(0);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split('-');
    handleFilterChange('sortBy', sortBy);
    handleFilterChange('sortDirection', sortDirection);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });
    setSearchParams({});
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {filters.keyword ? `Kết quả tìm kiếm: "${filters.keyword}"` : 'Tìm kiếm sản phẩm'}
          </h1>
          <p className="text-gray-600">
            Tìm thấy {items.length} sản phẩm
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Bộ lọc</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá (VNĐ)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
              <span className="text-gray-600">
                Hiển thị {items.length} sản phẩm
              </span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <select
                  value={`${filters.sortBy}-${filters.sortDirection}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-4">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                      if (pageNum >= totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
