import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import { useCart } from '../../contexts/CartContext';
import { createOrder, generateOrderCode } from '../../services/orderService';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, formattedSubtotal, formatPrice, clearCart } = useCart();
  
  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    full_name: '',
    phone_number: '',
    email: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Vietnam'
  });

  const [billingAddress, setBillingAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Vietnam'
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Customer info validation
    if (!customerInfo.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    }
    if (!customerInfo.phone_number.trim()) {
      newErrors.phone_number = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone_number.replace(/\s+/g, ''))) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Shipping address validation
    if (!shippingAddress.address_line1.trim()) {
      newErrors.shipping_address_line1 = 'Vui lòng nhập địa chỉ';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.shipping_city = 'Vui lòng nhập thành phố';
    }

    // Billing address validation (if different from shipping)
    if (!sameAsShipping) {
      if (!billingAddress.address_line1.trim()) {
        newErrors.billing_address_line1 = 'Vui lòng nhập địa chỉ thanh toán';
      }
      if (!billingAddress.city.trim()) {
        newErrors.billing_city = 'Vui lòng nhập thành phố thanh toán';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerInfo,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        orderNotes,
        items,
        subtotal
      };

      console.log('Creating order with data:', orderData);

      // Create order using order service
      const result = await createOrder(orderData);
      
      // Generate order code for display
      const orderCode = generateOrderCode(result.order.id);
      
      console.log('Order created successfully:', result);
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate to success page with order ID
      navigate(`/order-success/${result.order.id}`, {
        state: {
          order: result.order,
          orderCode,
          customer: result.user
        }
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Có lỗi xảy ra khi tạo đơn hàng: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update billing address when shipping changes (if same as shipping)
  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, sameAsShipping]);

  if (items.length === 0) {
    return null; // Will redirect to cart
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
            <li><Link to="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li className="text-gray-900 font-medium">Thanh toán</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất thông tin để mua hàng - Chúng tôi sẽ liên hệ qua Zalo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin khách hàng
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerInfo.full_name}
                      onChange={(e) => setCustomerInfo({...customerInfo, full_name: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.full_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                    {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại Zalo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone_number}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone_number: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0xxx xxx xxx (Zalo)"
                    />
                    {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                    <p className="text-xs text-gray-500 mt-1">Chúng tôi sẽ liên hệ qua Zalo để xác nhận đơn hàng</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (tùy chọn)
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Địa chỉ giao hàng
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address_line1}
                      onChange={(e) => setShippingAddress({...shippingAddress, address_line1: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.shipping_address_line1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.shipping_address_line1 && <p className="text-red-500 text-sm mt-1">{errors.shipping_address_line1}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address_line2}
                      onChange={(e) => setShippingAddress({...shippingAddress, address_line2: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tòa nhà, căn hộ, tầng..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.shipping_city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="TP.HCM, Hà Nội..."
                      />
                      {errors.shipping_city && <p className="text-red-500 text-sm mt-1">{errors.shipping_city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tỉnh/Thành phố"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã bưu chính
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zip_code}
                        onChange={(e) => setShippingAddress({...shippingAddress, zip_code: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="70000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Địa chỉ thanh toán
                  </h2>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Giống địa chỉ giao hàng</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ thanh toán <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={billingAddress.address_line1}
                        onChange={(e) => setBillingAddress({...billingAddress, address_line1: e.target.value})}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.billing_address_line1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Số nhà, tên đường"
                      />
                      {errors.billing_address_line1 && <p className="text-red-500 text-sm mt-1">{errors.billing_address_line1}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ chi tiết (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={billingAddress.address_line2}
                        onChange={(e) => setBillingAddress({...billingAddress, address_line2: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tòa nhà, căn hộ, tầng..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.billing_city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="TP.HCM, Hà Nội..."
                        />
                        {errors.billing_city && <p className="text-red-500 text-sm mt-1">{errors.billing_city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố
                        </label>
                        <input
                          type="text"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tỉnh/Thành phố"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mã bưu chính
                        </label>
                        <input
                          type="text"
                          value={billingAddress.zip_code}
                          onChange={(e) => setBillingAddress({...billingAddress, zip_code: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="70000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                  </svg>
                  Phương thức thanh toán
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      disabled
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Thanh toán online</div>
                      <div className="text-sm text-gray-500">Sắp ra mắt - MoMo, ZaloPay, VNPay</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                  Ghi chú mua hàng
                </h2>
                
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ghi chú thêm về việc mua hàng (tùy chọn)..."
                />
              </div>

              {/* Contact Reminder */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm border-2 border-green-200 p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      📞 Sau khi đặt hàng thành công
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      <strong>Chúng tôi sẽ liên hệ với bạn qua Zalo trong vòng 30 phút</strong> để hướng dẫn gửi hình ảnh thiết kế!
                    </p>
                    
                    <div className="bg-white rounded-lg p-5 mb-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">📱 Số Zalo liên hệ:</p>
                        <p className="text-2xl font-bold text-green-600 mb-2">0123 456 789</p>
                        <p className="text-sm text-gray-600">Hỗ trợ 24/7 - Phản hồi nhanh trong 30 phút</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                        <p className="text-gray-700">Bạn hoàn tất đơn hàng và nhận mã đơn hàng</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                        <p className="text-gray-700">Chúng tôi sẽ nhắn tin Zalo để hướng dẫn gửi hình</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                        <p className="text-gray-700">Bạn gửi file thiết kế theo hướng dẫn</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                        <p className="text-gray-700">Chúng tôi xác nhận và bắt đầu in ấn</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-blue-800">
                          <strong>Lưu ý:</strong> Vui lòng để số điện thoại Zalo hoạt động để chúng tôi có thể liên hệ nhanh chóng. 
                          Chúng tôi sẽ hướng dẫn chi tiết cách gửi file phù hợp nhất.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.product_name}
                      </h4>
                      <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({itemCount} sản phẩm)</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Tổng cộng</span>
                  <span>{formattedSubtotal}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                size="large" 
                fullWidth 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 mb-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                    </svg>
                    Mua hàng - {formattedSubtotal}
                  </span>
                )}
              </Button>

              <Link to="/cart">
                <Button 
                  variant="outline" 
                  size="large" 
                  fullWidth
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    Quay lại giỏ hàng
                  </span>
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bảo mật thông tin 100%
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Giao hàng toàn quốc
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
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout; 