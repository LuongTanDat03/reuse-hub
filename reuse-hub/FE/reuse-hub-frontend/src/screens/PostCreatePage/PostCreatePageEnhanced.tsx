import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as itemsAPI from '../../api/items';
import LoadingSpinner from '../../components/LoadingSpinner';

const PostCreatePageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    { value: 'ELECTRONICS', label: 'Điện tử', icon: '💻' },
    { value: 'FASHION', label: 'Thời trang', icon: '👕' },
    { value: 'HOME', label: 'Đồ gia dụng', icon: '🏠' },
    { value: 'BOOKS', label: 'Sách', icon: '📚' },
    { value: 'SPORTS', label: 'Thể thao', icon: '⚽' },
    { value: 'TOYS', label: 'Đồ chơi', icon: '🧸' },
    { value: 'BEAUTY', label: 'Làm đẹp', icon: '💄' },
    { value: 'OTHER', label: 'Khác', icon: '📦' },
  ];

  const conditions = [
    { value: 'NEW', label: 'Mới', description: 'Chưa qua sử dụng' },
    { value: 'LIKE_NEW', label: 'Như mới', description: '99% mới, ít sử dụng' },
    { value: 'GOOD', label: 'Tốt', description: 'Hoạt động tốt, có vết sử dụng nhẹ' },
    { value: 'FAIR', label: 'Khá', description: 'Có dấu hiệu sử dụng rõ' },
    { value: 'POOR', label: 'Cũ', description: 'Nhiều vết sử dụng' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    if (images.length + files.length > 10) {
      alert('Tối đa 10 ảnh');
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Mỗi ảnh không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Chỉ chấp nhận file ảnh');
        return;
      }
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Vui lòng nhập giá hợp lệ';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (!formData.condition) {
      newErrors.condition = 'Vui lòng chọn tình trạng';
    }

    if (images.length === 0) {
      newErrors.images = 'Vui lòng thêm ít nhất 1 ảnh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      navigate('/login');
      return;
    }

    if (!validate()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);

      const itemData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
      };

      const response = await itemsAPI.createItem(user.id, itemData, images);

      if (response.status === 200 || response.status === 201) {
        alert('Đăng sản phẩm thành công!');
        navigate(`/items/${response.data.id}`);
      } else {
        alert(response.message || 'Đăng sản phẩm thất bại');
      }
    } catch (error: any) {
      console.error('Failed to create item:', error);
      alert(error.response?.data?.message || 'Không thể đăng sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng sản phẩm</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold">Đăng tin bán sản phẩm</h1>
          <p className="text-gray-600 mt-2">
            Điền đầy đủ thông tin để sản phẩm của bạn được nhiều người quan tâm hơn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              Hình ảnh sản phẩm <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Thêm tối đa 10 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
            </p>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Ảnh đại diện
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {images.length < 10 && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : errors.images
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-2">
                  Kéo thả ảnh vào đây hoặc
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Chọn ảnh
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG hoặc GIF. Tối đa 5MB mỗi ảnh. ({images.length}/10)
                </p>
              </div>
            )}
            {errors.images && (
              <p className="text-sm text-red-600 mt-2">{errors.images}</p>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>

            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: iPhone 13 Pro Max 256GB màu xanh"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              <div className="flex justify-between mt-1">
                {errors.title ? (
                  <p className="text-sm text-red-600">{errors.title}</p>
                ) : (
                  <p className="text-sm text-gray-500">Tiêu đề ngắn gọn, dễ hiểu</p>
                )}
                <p className="text-sm text-gray-500">{formData.title.length}/100</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Mô tả chi tiết về sản phẩm: tình trạng, xuất xứ, lý do bán..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">Mô tả càng chi tiết càng tốt</p>
                )}
                <p className="text-sm text-gray-500">{formData.description.length}/2000</p>
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="1000000"
                min="0"
                step="1000"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Category & Condition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Phân loại</h2>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: cat.value }));
                      setErrors(prev => ({ ...prev, category: '' }));
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.category === cat.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 mt-2">{errors.category}</p>
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tình trạng <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, condition: cond.value }));
                      setErrors(prev => ({ ...prev, condition: '' }));
                    }}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      formData.condition === cond.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{cond.label}</div>
                    <div className="text-sm text-gray-600">{cond.description}</div>
                  </button>
                ))}
              </div>
              {errors.condition && (
                <p className="text-sm text-red-600 mt-2">{errors.condition}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Địa điểm</h2>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="VD: Quận 1, TP.HCM"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Địa chỉ giúp người mua dễ dàng liên hệ hơn
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang đăng...
                </span>
              ) : (
                'Đăng tin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreatePageEnhanced;
