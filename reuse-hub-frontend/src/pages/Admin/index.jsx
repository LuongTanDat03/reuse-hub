import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAdmin } from '../../hooks/useAdmin';

const Admin = () => {
  const {
    categories,
    products,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useAdmin();

  // State for forms
  const [categoryForm, setCategoryForm] = useState({ name: '', editId: null });
  const [productForm, setProductForm] = useState({ name: '', categoryId: '', editId: null });
  const [activeTab, setActiveTab] = useState('categories');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const result = categoryForm.editId
      ? await updateCategory(categoryForm.editId, categoryForm.name)
      : await addCategory(categoryForm.name);

    if (result.success) {
      setCategoryForm({ name: '', editId: null });
      showNotification(
        categoryForm.editId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!'
      );
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleCategoryEdit = (category) => {
    setCategoryForm({ name: category.name, editId: category.id });
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const result = await deleteCategory(id);
      if (result.success) {
        showNotification('Xóa danh mục thành công!');
      } else {
        showNotification(result.error, 'error');
      }
    }
  };

  // Product handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.categoryId) return;

    const result = productForm.editId
      ? await updateProduct(productForm.editId, productForm.name, parseInt(productForm.categoryId))
      : await addProduct(productForm.name, parseInt(productForm.categoryId));

    if (result.success) {
      setProductForm({ name: '', categoryId: '', editId: null });
      showNotification(
        productForm.editId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!'
      );
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleProductEdit = (product) => {
    setProductForm({ name: product.name, categoryId: product.category_id, editId: product.id });
  };

  const handleProductDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const result = await deleteProduct(id);
      if (result.success) {
        showNotification('Xóa sản phẩm thành công!');
      } else {
        showNotification(result.error, 'error');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không có danh mục';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <main className="w-full">
        {/* Banner */}
        <div className="w-full bg-[linear-gradient(90deg,#457df6_0%,_#885ef6_100%)] py-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-white">
            <h1 className="text-5xl font-bold">Quản trị hệ thống</h1>
            <p className="font-medium mt-2">Quản lý danh mục và sản phẩm</p>
          </div>
        </div>

        {/* Admin Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Lỗi: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 bg-white p-1 rounded-lg shadow mb-6">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quản lý danh mục ({categories.length})
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quản lý sản phẩm ({products.length})
                </button>
              </div>

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Category Form */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4">
                      {categoryForm.editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                    </h3>
                    <form onSubmit={handleCategorySubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên danh mục
                        </label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập tên danh mục"
                          required
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {categoryForm.editId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {categoryForm.editId && (
                          <button
                            type="button"
                            onClick={() => setCategoryForm({ name: '', editId: null })}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Categories List */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Danh sách danh mục</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <span className="font-medium">{category.name}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCategoryEdit(category)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleCategoryDelete(category.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Chưa có danh mục nào</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Form */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4">
                      {productForm.editId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h3>
                    <form onSubmit={handleProductSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên sản phẩm
                        </label>
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nhập tên sản phẩm"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục
                        </label>
                        <select
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {productForm.editId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {productForm.editId && (
                          <button
                            type="button"
                            onClick={() => setProductForm({ name: '', categoryId: '', editId: null })}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Products List */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Danh sách sản phẩm</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{getCategoryName(product.category_id)}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProductEdit(product)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleProductDelete(product.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Chưa có sản phẩm nào</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin; 