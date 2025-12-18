import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { createAuction } from '../../api/auction';
import { getAllCategories } from '../../api/item';
import { Category } from '../../types/api';
import { CreateAuctionRequest } from '../../types/auction';

export const CreateAuctionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    buyNowPrice: '',
    reservePrice: '',
    startTime: '',
    endTime: '',
    categoryId: '',
    address: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imagePreviews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Set default times
  useEffect(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days from now

    setFormData((prev) => ({
      ...prev,
      startTime: formatDateTimeLocal(startTime),
      endTime: formatDateTimeLocal(endTime),
    }));
  }, []);

  const formatDateTimeLocal = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = files.filter((f) => /image\/(jpeg|png|webp|gif)/.test(f.type));
    const total = [...images, ...validFiles].slice(0, 8);
    setImages(total);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (formData.title.length < 10) newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    
    if (!formData.startingPrice) newErrors.startingPrice = 'Vui lòng nhập giá khởi điểm';
    if (Number(formData.startingPrice) < 1000) newErrors.startingPrice = 'Giá khởi điểm tối thiểu 1,000đ';
    
    if (!formData.bidIncrement) newErrors.bidIncrement = 'Vui lòng nhập bước giá';
    if (Number(formData.bidIncrement) < 1000) newErrors.bidIncrement = 'Bước giá tối thiểu 1,000đ';
    
    if (formData.buyNowPrice && Number(formData.buyNowPrice) <= Number(formData.startingPrice)) {
      newErrors.buyNowPrice = 'Giá mua ngay phải lớn hơn giá khởi điểm';
    }

    if (!formData.startTime) newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
    if (!formData.endTime) newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
      const minDuration = 60 * 60 * 1000; // 1 hour
      if (end.getTime() - start.getTime() < minDuration) {
        newErrors.endTime = 'Phiên đấu giá phải kéo dài ít nhất 1 giờ';
      }
    }

    if (images.length === 0) newErrors.images = 'Vui lòng thêm ít nhất 1 hình ảnh';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const request: CreateAuctionRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        images: [], // Images will be uploaded by backend
        startingPrice: Number(formData.startingPrice),
        bidIncrement: Number(formData.bidIncrement),
        buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : undefined,
        reservePrice: formData.reservePrice ? Number(formData.reservePrice) : undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        categoryId: formData.categoryId || undefined,
        address: formData.address.trim() || undefined,
      };

      const response = await createAuction(user.id, request, images);
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Tạo phiên đấu giá thành công!');
        navigate(`/auction/${response.data.id}`);
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🔨 Tạo phiên đấu giá mới</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề phiên đấu giá"
                    disabled={loading}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả chi tiết về sản phẩm đấu giá"
                    className="w-full border rounded-md p-3 min-h-[120px] text-sm"
                    disabled={loading}
                  />
                </div>

                {/* Price Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startingPrice">Giá khởi điểm (VND) *</Label>
                    <Input
                      id="startingPrice"
                      name="startingPrice"
                      type="number"
                      value={formData.startingPrice}
                      onChange={handleChange}
                      placeholder="Ví dụ: 100000"
                      disabled={loading}
                    />
                    {errors.startingPrice && <p className="text-sm text-red-600">{errors.startingPrice}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bidIncrement">Bước giá (VND) *</Label>
                    <Input
                      id="bidIncrement"
                      name="bidIncrement"
                      type="number"
                      value={formData.bidIncrement}
                      onChange={handleChange}
                      placeholder="Ví dụ: 10000"
                      disabled={loading}
                    />
                    {errors.bidIncrement && <p className="text-sm text-red-600">{errors.bidIncrement}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyNowPrice">Giá mua ngay (VND)</Label>
                    <Input
                      id="buyNowPrice"
                      name="buyNowPrice"
                      type="number"
                      value={formData.buyNowPrice}
                      onChange={handleChange}
                      placeholder="Để trống nếu không cho mua ngay"
                      disabled={loading}
                    />
                    {errors.buyNowPrice && <p className="text-sm text-red-600">{errors.buyNowPrice}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reservePrice">Giá sàn (VND)</Label>
                    <Input
                      id="reservePrice"
                      name="reservePrice"
                      type="number"
                      value={formData.reservePrice}
                      onChange={handleChange}
                      placeholder="Giá tối thiểu để bán"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Danh mục</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                    disabled={loading}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ giao hàng/nhận hàng"
                    disabled={loading}
                  />
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <Label>Hình ảnh sản phẩm *</Label>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleImagesChange}
                    className="block"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Tối đa 8 hình, định dạng: JPG, PNG, WEBP, GIF</p>
                  {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={src} className="relative group">
                          <img src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#214d8c] hover:bg-[#1a3d6e]"
                    disabled={loading}
                  >
                    {loading ? 'Đang tạo...' : '🔨 Tạo phiên đấu giá'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAuctionPage;
