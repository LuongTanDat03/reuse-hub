import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as itemsAPI from '../../api/items';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditItemPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<any>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
  });

  const categories = [
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
    { value: 'NEW', label: 'Mới' },
    { value: 'LIKE_NEW', label: 'Như mới' },
    { value: 'GOOD', label: 'Tốt' },
    { value: 'FAIR', label: 'Khá' },
    { value: 'POOR', label: 'Cũ' },
  ];

  useEffect(() => {
    if (itemId && user?.id) {
      loadItem();
    }
  }, [itemId, user?.id]);

  const loadItem = async () => {
    if (!itemId || !user?.id) return;

    try {
      setLoading(true);
      const response = await itemsAPI.getItem(itemId);

      if (response.status === 200 && response.data) {
        const itemData = response.data;

        // Check if user owns this item
        if (itemData.userId !== user.id) {
          alert('Bạn không có quyền chỉnh sửa sản phẩm này');
          navigate(`/items/${itemId}`);
          return;
        }

        setItem(itemData);
        setFormData({
          title: itemData.title || '',
          description: itemData.description || '',
          price: itemData.price?.toString() || '',
          category: itemData.category || '',
          condition: itemData.condition || '',
          location: itemData.location || '',
        });
        setExistingImages(itemData.images || []);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      alert('Không thể tải thông tin sản phẩm');
      navigate('/my-posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (existingImages.length + newImages.length + files.length > 10) {
      alert('Tối đa 10 ảnh');
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Mỗi ảnh không được vượt quá 5MB');
        return;
      }
    }

    setNewImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemId || !user?.id) return;

    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (existingImages.length + newImages.length === 0) {
      alert('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }

    try {
      setSaving(true);

      const itemData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        existingImages, // Keep track of existing images
      };

      const response = await itemsAPI.updateItem(user.id, itemId, itemData, newImages);

      if (response.status === 200) {
        alert('Cập nhật sản phẩm thành công!');
        navigate(`/items/${itemId}`);
      } else {
        alert(response.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Failed to update item:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
            <button
              onClick={() => navigate(`/items/${itemId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Ảnh mới:</p>
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {existingImages.length + newImages.length < 10 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-gray-600">Thêm ảnh ({existingImages.length + newImages.length}/10)</p>
                  <p className="text-sm text-gray-500 mt-1">Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: iPhone 13 Pro Max 256GB"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Mô tả chi tiết về sản phẩm..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ) <span className="text-red-500">*</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn tình trạng</option>
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
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
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/items/${itemId}`)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang lưu...
                </span>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;
