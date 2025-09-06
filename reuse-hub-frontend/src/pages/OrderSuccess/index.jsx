import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import { getOrderById, formatAddress } from '../../services/orderService';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get order data from navigation state or fetch from API
  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (location.state?.order) {
          // Use order data from navigation state
          setOrder({
            ...location.state.order,
            orderCode: location.state.orderCode,
            customer: location.state.customer
          });
        } else if (orderId) {
          // Fetch order data from API
          const orderData = await getOrderById(orderId);
          setOrder(orderData);
        } else {
          setError('Không tìm thấy thông tin đơn hàng');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, location.state]);

  // Format price function
  const formatPrice = (price) => {
    if (!price || price === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <div className="text-red-500 mb-8">
              <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
            <Link to="/products">
              <Button variant="outline">Tiếp tục mua sắm</Button>
            </Link>
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
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mua hàng thành công!</h1>
          <p className="text-lg text-gray-600 mb-2">Cảm ơn bạn đã mua hàng tại IN XIN</p>
          <p className="text-gray-500">Chúng tôi sẽ liên hệ qua Zalo trong thời gian sớm nhất</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Thông tin đơn hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Mã đơn hàng</h3>
                  <p className="text-lg font-bold text-blue-600">
                    {order.orderCode || `DH${order.id.toString().padStart(6, '0')}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ngày mua hàng</h3>
                  <p className="text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Đang xử lý
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Phương thức thanh toán</h3>
                  <p className="text-gray-900">
                    {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin khách hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Họ và tên</h3>
                  <p className="text-gray-900">{order.customer?.full_name || order.customer_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Số điện thoại</h3>
                  <p className="text-gray-900">{order.customer?.phone_number || order.customer_phone}</p>
                </div>
                {(order.customer?.email || order.customer_email) && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                    <p className="text-gray-900">{order.customer?.email || order.customer_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa chỉ giao hàng
              </h2>
              
              <div className="text-gray-900">
                {formatAddress(order, 'shipping')}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Chi tiết đơn hàng
              </h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📦</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {item.product_details_json?.product_name || item.product?.product_name || 'Sản phẩm'}
                      </h4>
                      
                      {item.product_details_json?.specifications && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {Object.entries(item.product_details_json.specifications).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                              <span className="ml-1 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Số lượng: <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {formatPrice(item.unit_price_at_order_vnd)}/cái
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {formatPrice(item.total_item_price_vnd)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                  Ghi chú mua hàng
                </h2>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary & Next Steps */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.total_amount_vnd)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                {order.rush_fee_applied && (
                  <div className="flex justify-between text-gray-600">
                    <span>Phí gấp</span>
                    <span>{formatPrice(order.rush_fee_amount_vnd)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total_amount_vnd + (order.rush_fee_amount_vnd || 0))}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  🎉 Đặt hàng thành công!
                </h3>
                <p className="text-xl text-gray-700 mb-6">
                  <strong>Chúng tôi sẽ liên hệ với bạn qua Zalo trong vòng 30 phút</strong>
                </p>
                <p className="text-gray-600 mb-6">
                  Mã đơn hàng của bạn: <strong className="text-blue-600 text-lg">{order.orderCode}</strong>
                </p>
                
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">📱 Số Zalo liên hệ</p>
                      <p className="text-3xl font-bold text-green-600">0123 456 789</p>
                      <p className="text-gray-600">Hỗ trợ 24/7 - Phản hồi nhanh</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  🔄 Quy trình tiếp theo
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      ✓
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Bạn đã hoàn tất đơn hàng</h5>
                      <p className="text-gray-600 text-sm">Mã đơn hàng: {order.orderCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Chúng tôi sẽ liên hệ qua Zalo</h5>
                      <p className="text-gray-600 text-sm">Trong vòng 30 phút để hướng dẫn gửi hình ảnh thiết kế</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Bạn gửi file thiết kế</h5>
                      <p className="text-gray-600 text-sm">Theo hướng dẫn chi tiết của chúng tôi qua Zalo</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      4
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Xác nhận và in ấn</h5>
                      <p className="text-gray-600 text-sm">Chúng tôi kiểm tra file và bắt đầu quy trình in ấn</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">
                      5
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">Giao hàng tận nơi</h5>
                      <p className="text-gray-600 text-sm">Sản phẩm hoàn thiện sẽ được giao đến địa chỉ của bạn</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-blue-800">
                    <p className="font-semibold mb-2">🔔 Quan trọng:</p>
                    <p className="text-sm">
                      Vui lòng để điện thoại Zalo luôn sẵn sàng để chúng tôi có thể liên hệ nhanh chóng. 
                      Chúng tôi sẽ hướng dẫn chi tiết và hỗ trợ bạn trong toàn bộ quá trình.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link to="/products">
                <Button 
                  size="large" 
                  fullWidth 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Tiếp tục mua sắm
                  </span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="large" 
                fullWidth
                onClick={() => window.print()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In đơn hàng
                </span>
              </Button>
            </div>

            {/* Contact Info */}
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Cần hỗ trợ?</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Zalo/Hotline: 0123-456-789
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email: support@inxin.vn
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hỗ trợ qua Zalo: 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess; 