import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Button from '../../components/ui/Button';
import { useProductDetail } from '../../hooks/useProductDetail';
import { useCart } from '../../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const {
    product, productDetails, loading, error, isRangeBasedPricing,
    getFormsFramesPrice, getStrapPrice, getWobblerPrice, getFanPrice,
    getHairClipPrice, getPuzzlePrice, getStandeeMiniPrice, getPosterPrice
  } = useProductDetail(id);
  const { addToCart, isInCart, getItemQuantity, formatPrice: cartFormatPrice } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentPrice, setCurrentPrice] = useState(null);
  const [quantity, setQuantity] = useState(() => {
    if (
      product?.product_name === 'Các Loại Poster' ||
      product?.product_name === 'Poster' ||
      product?.product_name === 'POSTER'
    ) {
      return 50;
    }
    return 1;
  });
  const [totalPrice, setTotalPrice] = useState(null); // Total price = unit price * quantity
  const [addToCartSuccess, setAddToCartSuccess] = useState(false); // Success message state
  
  // Get product name for range-based pricing logic
  const productName = product?.product_name;

  // Handle add to cart functionality
  const handleAddToCart = () => {
    if (!product || !currentPrice) {
      alert('Vui lòng chọn đầy đủ thông số sản phẩm');
      return;
    }

    const cartQuantity = isRangeBasedPricing ? quantity : 1;
    const unitPrice = currentPrice;
    
    // Prepare specifications object
    const specifications = { ...selectedOptions };
    
    // Add to cart
    addToCart(product, specifications, cartQuantity, unitPrice);
    
    // Show success message
    setAddToCartSuccess(true);
    setTimeout(() => setAddToCartSuccess(false), 3000);
  };

  // Check if can add to cart
  const canAddToCart = product && currentPrice && Object.keys(selectedOptions).length > 0;

  // Function to format price in Vietnamese currency
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Function to format column names for display in Vietnamese
  const formatColumnName = (columnName) => {
    const columnMappings = {
      // Common columns
      'size_category': 'Khổ giấy',
      'material_type': 'Loại vật liệu',
      'unit_price_vnd': 'Giá đơn vị (VND)',
      'size_cm': 'Kích thước (cm)',
      'paper_type': 'Loại giấy',
      'quantity_tier': 'Số lượng',
      'price_per_tier_vnd': 'Giá (VND)',
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
      'time_category': 'Thời gian',
      'percentage_surcharge': 'Phụ phí (%)',
      'min_fee_vnd': 'Phí tối thiểu (VND)',
      'has_background_coverage': 'Có phủ nền',
      'has_seal_adhesive': 'Có keo nắp',
      'special_size_fee_25x43_vnd': 'Phí đặc biệt 25x43cm (VND)',
      'box_fee_per_unit_vnd': 'Phí hộp/đơn vị (VND)',
      'quantity_a3_sheet_tier': 'Số tờ A3',
      'cutting_fee_note': 'Ghi chú phí cắt',
      'includes_lamination': 'Bao gồm cán màng',
      'includes_die_cut': 'Bao gồm bế viền',
      'volume_ml': 'Thể tích (ml)',
      'bottle_type': 'Loại bình',
      'printing_sides': 'Số mặt in',
      'quantity_lốc': 'Số lốc',
      'sides': 'Số mặt',
      'price_per_lốc_vnd': 'Giá/lốc (VND)',
      'corner_rounding_fee_note': 'Ghi chú phí bo góc',
      'effect_name': 'Tên hiệu ứng',
      'additional_price_per_unit_vnd': 'Giá thêm/đơn vị (VND)',
      'format_type': 'Định dạng',
      'fan_type': 'Loại quạt',
      'clip_type': 'Loại kẹp',
      'image_material': 'Vật liệu hình ảnh',
      'base_type': 'Loại chân',
      'spring_material': 'Vật liệu lò xo',
      'image_height_cm': 'Chiều cao hình (cm)',
      'material_spec': 'Quy cách vật liệu',
      'binding_type': 'Loại đóng gáy',
      'shape_type': 'Hình dáng',
      'includes_stand': 'Bao gồm chân',
      'size_mm': 'Kích thước (mm)',
      'size_oz': 'Kích thước (oz)',
      'feature': 'Tính năng',
      'description': 'Mô tả',
      'number_of_pieces': 'Số mảnh',
      'has_effect': 'Có hiệu ứng',
      'test_sample_info': 'Thông tin mẫu test',
      'set_info': 'Thông tin bộ'
    };
    return columnMappings[columnName] || columnName.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  };



  // Format boolean values for display
  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    
    return String(value);
  };

  // Get available options from product details
  const availableOptions = useMemo(() => {
    if (!productDetails || productDetails.length === 0) return {};
    
    const options = {};
    const excludeColumns = [
      'id', 
      'product_id', 
      'created_at', 
      'updated_at',
      'min_quantity',      // Don't show as user option
      'max_quantity',      // Don't show as user option
      'set_info',          // Usually descriptive text, not selectable
      'test_sample_info'   // Usually descriptive text, not selectable
    ];
    const priceColumns = Object.keys(productDetails[0]).filter(key => 
      key.includes('price') || key.includes('vnd') || key.includes('fee')
    );
    
    // Get all non-price columns as selectable options
    Object.keys(productDetails[0]).forEach(key => {
      if (!excludeColumns.includes(key) && !priceColumns.includes(key)) {
        const uniqueValues = [...new Set(productDetails.map(item => item[key]))];
        if (uniqueValues.length > 1 || (uniqueValues.length === 1 && uniqueValues[0] !== null)) {
          options[key] = uniqueValues.filter(val => val !== null && val !== undefined);
        }
      }
    });
    
    return options;
  }, [productDetails]);

  // Set default selected options when options are available
  useEffect(() => {
    if (Object.keys(availableOptions).length > 0) {
      const defaultOptions = {};
      Object.keys(availableOptions).forEach(key => {
        if (availableOptions[key].length > 0) {
          defaultOptions[key] = availableOptions[key][0];
        }
      });
      setSelectedOptions(defaultOptions);
    }
  }, [availableOptions]);

  // Calculate current price based on selected options and quantity
  useEffect(() => {
    const calculatePrice = async () => {
      if (productDetails.length > 0) {
        
        if (isRangeBasedPricing) {
          // Handle range-based pricing
          if (Object.keys(selectedOptions).length > 0) {
            
            // Determine which pricing function to use based on product name
            
            try {
              let unitPrice = null;
              
              if (productName === 'FORM/ FORMEX/ FRAME') {
                // Handle forms_formex_frames table
                const productType = selectedOptions.product_type;
                const sizeCategory = selectedOptions.size_category;
                const thicknessMm = selectedOptions.thickness_mm || null;
                
                if (productType && sizeCategory) {
                  unitPrice = await getFormsFramesPrice(productType, sizeCategory, thicknessMm, quantity);
                }
              } else if (productName === 'STRAP/Name Tag/Dây Móc Khóa') {
                // Handle straps_name_tags_keychains table
                const productType = selectedOptions.product_type;
                const dimensionsCm = selectedOptions.dimensions_cm;
                const printingMethod = selectedOptions.printing_method;
                
                if (productType && dimensionsCm && printingMethod) {
                  unitPrice = await getStrapPrice(productType, dimensionsCm, printingMethod, quantity);
                }
              } else if (productName === 'Wobbler') {
                // Handle wobblers table
                const baseType = selectedOptions.base_type;
                const springMaterial = selectedOptions.spring_material;
                const imageMaterial = selectedOptions.image_material;
                const imageHeightCm = selectedOptions.image_height_cm;
                
                if (baseType && springMaterial && imageMaterial && imageHeightCm) {
                  unitPrice = await getWobblerPrice(baseType, springMaterial, imageMaterial, imageHeightCm, quantity);
                }
              } else if (productName === 'Các Loại Quạt' || productName === 'Quạt Quảng Cáo') {
                // Handle promotional_fans table
                const fanType = selectedOptions.fan_type;
                console.log('Fan pricing - selectedOptions:', selectedOptions);
                console.log('Fan pricing - fanType:', fanType);
                console.log('Fan pricing - quantity:', quantity);
                console.log('Fan pricing - product id:', id);
                
                if (fanType) {
                  unitPrice = await getFanPrice(fanType, quantity, parseInt(id));
                }
              } else if (productName === 'KẸP TÓC LÒ XO' || productName === 'Kẹp Tóc Lò Xo') {
                // Handle hair_clips table
                const clipType = selectedOptions.clip_type;
                const imageMaterial = selectedOptions.image_material;
                console.log('Hair clip pricing - selectedOptions:', selectedOptions);
                console.log('Hair clip pricing - clipType:', clipType);
                console.log('Hair clip pricing - imageMaterial:', imageMaterial);
                console.log('Hair clip pricing - quantity:', quantity);
                console.log('Hair clip pricing - product id:', id);
                
                if (clipType) {
                  unitPrice = await getHairClipPrice(clipType, imageMaterial, quantity, parseInt(id));
                }
              } else if (productName === 'TRANH GHÉP' || productName === 'Tranh Ghép (Puzzle)') {
                // Handle puzzles table
                const sizeCategory = selectedOptions.size_category;
                const numberOfPieces = selectedOptions.number_of_pieces;
                console.log('Puzzle pricing - selectedOptions:', selectedOptions);
                console.log('Puzzle pricing - sizeCategory:', sizeCategory);
                console.log('Puzzle pricing - numberOfPieces:', numberOfPieces);
                console.log('Puzzle pricing - quantity:', quantity);
                console.log('Puzzle pricing - product id:', id);
                
                if (sizeCategory) {
                  unitPrice = await getPuzzlePrice(sizeCategory, numberOfPieces, quantity, parseInt(id));
                }
              } else if (productName === 'STANDEE MINI' || productName === 'Standee Mini') {
                // Handle standee_mini table
                const dimensionsCm = selectedOptions.dimensions_cm;
                const includesStand = selectedOptions.includes_stand;
                console.log('Standee mini pricing - selectedOptions:', selectedOptions);
                console.log('Standee mini pricing - dimensionsCm:', dimensionsCm);
                console.log('Standee mini pricing - includesStand:', includesStand);
                console.log('Standee mini pricing - quantity:', quantity);
                console.log('Standee mini pricing - product id:', id);
                
                if (dimensionsCm !== undefined && includesStand !== undefined) {
                  unitPrice = await getStandeeMiniPrice(dimensionsCm, includesStand, quantity, parseInt(id));
                }
              } else if (
                productName === 'Các Loại Poster' ||
                productName === 'Poster' ||
                productName === 'POSTER'
              ) {
                const sizeCategory = selectedOptions.size_category;
                const paperType = selectedOptions.paper_type;
                const laminationType = selectedOptions.lamination_type;
                if (sizeCategory && paperType) {
                  unitPrice = await getPosterPrice(sizeCategory, paperType, laminationType, quantity, parseInt(id));
                }
              }
              
              setCurrentPrice(unitPrice);
              setTotalPrice(unitPrice ? unitPrice * quantity : null);
              
            } catch (error) {
              console.error('Error calculating range-based price:', error);
              setCurrentPrice(null);
              setTotalPrice(null);
            }
          } else {
            setCurrentPrice(null);
            setTotalPrice(null);
          }
        } else {
          // Handle regular pricing (existing logic)
          if (Object.keys(selectedOptions).length > 0) {
            const matchingItem = productDetails.find(item => {
        return Object.keys(selectedOptions).every(key => {
                return item[key] === selectedOptions[key];
        });
      });
            
            if (matchingItem) {
              // Find the price column
              const priceColumns = Object.keys(matchingItem).filter(key => 
                key.includes('price') || key.includes('vnd') || key.includes('fee')
              );
              const mainPriceColumn = priceColumns.find(col => 
                col.includes('price_per_tier') || 
                col.includes('unit_price') || 
                col.includes('price_per_lốc')
              ) || priceColumns[0];
              
              const unitPrice = matchingItem[mainPriceColumn] || null;
              setCurrentPrice(unitPrice);
              setTotalPrice(unitPrice ? unitPrice * quantity : null);
            } else {
              setCurrentPrice(null);
              setTotalPrice(null);
            }
          }
        }
      }
    };

    calculatePrice();
  }, [selectedOptions, productDetails, isRangeBasedPricing, quantity]);

  // Group details for better display
  const groupedDetails = useMemo(() => {
    if (!productDetails || productDetails.length === 0) return [];
    
    // Sort by quantity_tier if it exists, otherwise by first numeric column
    return [...productDetails].sort((a, b) => {
      if (a.quantity_tier && b.quantity_tier) {
        return a.quantity_tier - b.quantity_tier;
      }
      if (a.number_of_pages && b.number_of_pages) {
        return a.number_of_pages - b.number_of_pages;
      }
      return 0;
    });
  }, [productDetails]);

  // Get category icon
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
          <p className="text-xl text-gray-600">Đang tải chi tiết sản phẩm...</p>
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
        </div>
        <Link to="/products">
          <Button variant="outline">← Quay lại danh sách sản phẩm</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="text-center p-10">
        <div className="text-gray-500 mb-6">
          <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.213-2.172m12.426 0a9 9 0 11-12.426 0" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm không tồn tại hoặc đã được gỡ bỏ.</p>
        </div>
        <Link to="/products">
          <Button variant="outline">← Quay lại danh sách sản phẩm</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li className="font-medium" style={{ color: '#B4D334' }}>{product.product_name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Section - Left Side */}
          <div className="space-y-8">
                        {/* Product Image */}
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-gray-400">
                {product.img_url ? (
                  <img 
                    src={product.img_url} 
                    alt={product.product_name}
                    className="max-w-full max-h-80 object-contain mx-auto rounded-lg"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div 
                  className={`${product.img_url ? 'hidden' : 'block'}`}
                  style={{ display: product.img_url ? 'none' : 'block' }}
                >
                  <div className="text-6xl mb-4">{getCategoryIcon(product.product_category)}</div>
                  <p className="text-lg font-medium mb-2">Hình ảnh sản phẩm</p>
                  <p className="text-sm text-gray-500">{product.product_name}</p>
                </div>
              </div>
            </div>

            {/* Product Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {product.product_category}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.product_name}</h1>
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Liên hệ với chúng tôi để biết thêm thông tin chi tiết về sản phẩm này và nhận báo giá tốt nhất.'}
                </p>
              </div>
              
              {/* Quick Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Quy trình đặt hàng
                </h3>
                <ul className="space-y-2 text-xs text-blue-800">
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    Đặt hàng và thanh toán
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    Chúng tôi liên hệ trong 30 phút
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    Gửi file thiết kế qua Zalo
                  </li>
                  <li className="flex items-center">
                    <span className="w-5 h-5 mr-2 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    Nhận sản phẩm tại nhà
                  </li>
                </ul>
              </div>
            </div>
          </div>

                    {/* Product Options & Pricing - Right Side */}
          <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chọn thông số sản phẩm</h2>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            
            {productDetails && productDetails.length > 0 ? (
            <div className="space-y-6">
                {/* Options Selection */}
                <div className="space-y-5">
                  {Object.keys(availableOptions).map((optionKey, index) => (
                    <div key={optionKey} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          {formatColumnName(optionKey)}
                        </h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {availableOptions[optionKey].length} lựa chọn
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableOptions[optionKey].map(option => (
                      <button
                        key={option}
                            onClick={() => setSelectedOptions(prev => ({...prev, [optionKey]: option}))}
                            className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 relative ${
                              selectedOptions[optionKey] === option
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg transform scale-105'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            {formatValue(option, optionKey)}
                            {selectedOptions[optionKey] === option && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

                {/* Quantity Input for Range-Based Pricing */}
                {isRangeBasedPricing && (
                  <div className="space-y-4">
                    {/* Quantity Input */}
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Nhập số lượng cần đặt
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min={
                            product?.product_name === 'Các Loại Poster' ||
                            product?.product_name === 'Poster' ||
                            product?.product_name === 'POSTER'
                              ? 50
                              : 1
                          }
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(
                            product?.product_name === 'Các Loại Poster' ||
                            product?.product_name === 'Poster' ||
                            product?.product_name === 'POSTER'
                              ? 50
                              : 1,
                            parseInt(e.target.value) || 1
                          ))}
                          className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg text-center font-semibold text-lg focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-blue-700 bg-white p-2 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                                                    <span>
                            {currentPrice && `Giá hiện tại: ${formatPrice(currentPrice)}/cái cho ${quantity} sản phẩm`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Section */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-100">
                  {isRangeBasedPricing ? (
                    // Range-based pricing display
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Giá đơn vị
                        </span>
                        <div className="text-lg font-bold text-red-600">
                          {currentPrice ? formatPrice(currentPrice) : (
                            <span className="text-gray-500 text-sm">Liên hệ</span>
                          )}
                        </div>
                      </div>
                      <hr className="border-red-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Tổng tiền ({quantity} cái)
                        </span>
                        <div className="text-2xl font-bold text-red-600">
                          {totalPrice ? formatPrice(totalPrice) : (
                            <span className="text-gray-500 text-lg">Liên hệ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular pricing display  
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Giá sản phẩm
                      </span>
                      <div className="text-2xl font-bold text-red-600">
                        {currentPrice ? formatPrice(currentPrice) : (
                          <span className="text-gray-500 text-lg">Liên hệ</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentPrice && (
                    <div className="flex items-center text-xs text-green-600 font-medium mt-3">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Giá đã bao gồm VAT
                    </div>
                  )}
                </div>

                {/* Success Message */}
                {addToCartSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đã thêm vào giỏ hàng thành công!
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    size="large" 
                    fullWidth 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L14 18M14 18a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      {isRangeBasedPricing ? `Thêm vào giỏ - ${formatPrice(totalPrice || 0)}` : 'Thêm vào giỏ hàng'}
                    </span>
                  </Button>
                  
                  <Button 
                    size="large" 
                    fullWidth 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    disabled={!canAddToCart}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4" />
                      </svg>
                      {isRangeBasedPricing ? `Mua hàng - ${formatPrice(totalPrice || 0)}` : 'Mua hàng'}
                    </span>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="large" className="border-blue-600 text-blue-600 hover:bg-blue-50 py-3 font-semibold">
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                        </svg>
                        Giỏ hàng
                      </span>
                    </Button>
                    <Button variant="outline" size="large" className="border-green-600 text-green-600 hover:bg-green-50 py-3 font-semibold">
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.213-2.172m12.426 0a9 9 0 11-12.426 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông tin giá</h3>
                <p className="text-gray-600 mb-6 text-sm max-w-sm mx-auto">
                  Sản phẩm này chưa có bảng giá chi tiết. Vui lòng liên hệ để được tư vấn và báo giá chính xác nhất.
                </p>
                <Button size="large" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Liên hệ báo giá
                  </span>
                </Button>
            </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail; 