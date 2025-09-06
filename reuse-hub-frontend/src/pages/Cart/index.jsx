import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    itemCount, 
    subtotal, 
    formattedSubtotal,
    formatPrice 
  } = useCart();

  // Function to format column names for display
  const formatColumnName = (columnName) => {
    const columnMappings = {
      'size_category': 'Khổ giấy',
      'material_type': 'Loại vật liệu',
      'size_cm': 'Kích thước (cm)',
      'paper_type': 'Loại giấy',
      'color_type': 'Loại màu',
      'number_of_copies': 'Số liên',
      'number_of_pages': 'Số trang',
      'paper_weight_type': 'Định lượng giấy',
      'quantity_boxes': 'Số hộp',
      'lamination_type': 'Loại cán màng',
      'dimensions_cm': 'Kích thước (cm)',
      'product_type': 'Loại sản phẩm',
      'thickness_mm': 'Độ dày (mm)',
      'printing_method': 'Phương pháp in',
      'base_type': 'Loại chân',
      'spring_material': 'Vật liệu lò xo',
      'image_material': 'Vật liệu hình ảnh',
      'image_height_cm': 'Chiều cao hình (cm)',
    };
    return columnMappings[columnName] || columnName.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    return String(value);
  };

  // Handle quantity change
  const handleQuantityChange = (itemKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemKey);
    } else {
      updateQuantity(itemKey, newQuantity);
    }
  };

  // Handle clear cart with confirmation
  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <div className="text-gray-400 mb-8">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L14 18M14 18a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Giỏ hàng trống</h2>
              <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            </div>
            <div className="space-y-4">
              <Link to="/products">
                <Button size="large" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Tiếp tục mua sắm
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li className="text-gray-900 font-medium">Giỏ hàng</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
            <p className="text-gray-600 mt-2">{itemCount} sản phẩm trong giỏ hàng</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa tất cả
            </span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.key} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.product.product_category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa sản phẩm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-500">{formatColumnName(key)}:</span>
                          <span className="ml-1 font-medium">{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">Số lượng:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-100 border rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.key, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border rounded text-center text-sm"
                            min="1"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-100 border rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatPrice(item.unitPrice)}/cái
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({itemCount} sản phẩm)</span>
                <span>{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formattedSubtotal}</span>
              </div>
            </div>

            <div className="space-y-3">
                             <Link to="/checkout">
                                    <Button 
                     size="large" 
                     fullWidth 
                     className="bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                   >
                     <span className="flex items-center justify-center">
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                       </svg>
                       Mua hàng
                     </span>
                   </Button>
               </Link>
              
              <Link to="/products">
                <Button 
                  variant="outline" 
                  size="large" 
                  fullWidth
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Tiếp tục mua sắm
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Thanh toán an toàn và bảo mật
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Miễn phí vận chuyển toàn quốc
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hỗ trợ 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Printing Service Info */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                🖨️ Dịch Vụ In Ấn Chuyên Nghiệp
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Sau khi bạn đặt hàng, <strong>chúng tôi sẽ liên hệ qua Zalo</strong> để hướng dẫn gửi hình ảnh thiết kế!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Đặt hàng</h3>
                <p className="text-gray-600 text-sm">
                  Chọn sản phẩm, thông số kỹ thuật và hoàn tất đặt hàng để nhận mã đơn hàng
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Chúng tôi liên hệ</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Nhân viên sẽ nhắn tin Zalo trong 30 phút để hướng dẫn gửi hình
                </p>
                <div className="bg-green-50 px-3 py-2 rounded-lg">
                  <p className="text-green-700 font-semibold text-sm">📱 0123 456 789</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Nhận hàng</h3>
                <p className="text-gray-600 text-sm">
                  Gửi hình theo hướng dẫn → In ấn → Giao hàng tận nơi trong 2-3 ngày
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                ✨ Ưu điểm của dịch vụ
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">💬</span>
                    Tư vấn cá nhân hóa
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Hướng dẫn chi tiết qua Zalo
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Tư vấn file phù hợp với từng sản phẩm
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Phản hồi nhanh trong 30 phút
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs mr-2">🎨</span>
                    Hỗ trợ thiết kế
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Thiết kế miễn phí (file đơn giản)
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Chỉnh sửa file theo yêu cầu
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Tư vấn kỹ thuật miễn phí
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">💡 Lưu ý:</p>
                    <p>
                      Bạn không cần phải chuẩn bị file trước! Chúng tôi sẽ hướng dẫn chi tiết về định dạng, 
                      chất lượng và cách gửi file phù hợp nhất qua Zalo sau khi bạn đặt hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Cart; 