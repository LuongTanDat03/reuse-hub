import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ItemCreationRequest, Category } from "../../types/api";
import { getAllCategories } from "../../api/item";

interface BeItemProps {
  initialData?: Partial<ItemCreationRequest & { images?: File[] }>;
  onSubmit: (data: ItemCreationRequest, images: File[]) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  title?: string;
}

export const BeItem: React.FC<BeItemProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Đăng tin",
  title = "Thông tin sản phẩm",
}) => {
  const [formTitle, setFormTitle] = useState(initialData?.title || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [tags, setTags] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [latitude, setLatitude] = useState(
    initialData?.location?.latitude?.toString() || "10.7769"
  );
  const [longitude, setLongitude] = useState(
    initialData?.location?.longitude?.toString() || "106.7009"
  );
  const [images, setImages] = useState<File[]>(initialData?.images || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Constants for file validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const MAX_IMAGE_WIDTH = 1920;
  const MAX_IMAGE_HEIGHT = 1080;
  const COMPRESS_QUALITY = 0.8;

  const imagePreviews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Compress and resize image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
            if (width > height) {
              height = (height * MAX_IMAGE_WIDTH) / width;
              width = MAX_IMAGE_WIDTH;
            } else {
              width = (width * MAX_IMAGE_HEIGHT) / height;
              height = MAX_IMAGE_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            COMPRESS_QUALITY
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    
    // Validate file types
    const validTypeFiles = files.filter((f) =>
      /image\/(jpeg|png|webp|gif)/.test(f.type)
    );

    if (validTypeFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        images: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)',
      }));
    }

    // Validate file sizes
    const oversizedFiles = validTypeFiles.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: `Một số file vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB. Đang nén tự động...`,
      }));
    }

    // Compress and resize images
    try {
      const compressedFiles = await Promise.all(
        validTypeFiles.map((file) => {
          // Compress if > 2MB to reduce upload size
          if (file.size > 2 * 1024 * 1024) {
            return compressImage(file);
          }
          return Promise.resolve(file);
        })
      );

      const total = [...images, ...compressedFiles].slice(0, 8); // cap at 8 images
      setImages(total);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    } catch (error) {
      console.error('Error compressing images:', error);
      setErrors((prev) => ({
        ...prev,
        images: 'Lỗi khi xử lý ảnh. Vui lòng thử lại.',
      }));
    }
  };

  const removeImageAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formTitle.trim()) next.title = "Vui lòng nhập tiêu đề";
    if (!description.trim()) next.description = "Vui lòng nhập mô tả";
    if (price && Number(price) < 0) next.price = "Giá không hợp lệ";
    if (!categoryId) next.categoryId = "Chọn danh mục";
    if (!address.trim()) next.address = "Vui lòng nhập địa chỉ";
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) next.latitude = "Vĩ độ không hợp lệ (-90 đến 90)";
    if (isNaN(lng) || lng < -180 || lng > 180) next.longitude = "Kinh độ không hợp lệ (-180 đến 180)";
    
    // Validate images
    if (images.length > 0) {
      const oversizedImages = images.filter((img) => img.size > MAX_FILE_SIZE);
      if (oversizedImages.length > 0) {
        next.images = `Một số ảnh vẫn còn quá lớn. Vui lòng chọn lại ảnh nhỏ hơn ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      }
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const itemData: ItemCreationRequest = {
      title: formTitle.trim(),
      description: description.trim(),
      categoryId: categoryId,
      price: Number(price) || 0,
      address: address.trim(),
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    };
    
    // Note: Tags are not supported in creation request yet
    // They can be added later via update if needed

    await onSubmit(itemData, images);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Nhập tiêu đề tin"
                disabled={submitting}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VND)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Nhập giá (VND)"
                disabled={submitting}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <select
                id="category"
                className="h-9 w-full rounded-md border px-3 text-sm bg-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={submitting || loadingCategories}
              >
                <option value="">
                  {loadingCategories ? "Đang tải danh mục..." : "-- Chọn danh mục --"}
                </option>
                {categories && categories.length > 0 && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Q1, TPHCM"
                disabled={submitting}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude) *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ví dụ: 10.7769"
                disabled={submitting}
              />
              {errors.latitude && (
                <p className="text-sm text-red-600">{errors.latitude}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude) *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ví dụ: 106.7009"
                disabled={submitting}
              />
              {errors.longitude && (
                <p className="text-sm text-red-600">{errors.longitude}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô tả *</Label>
              <textarea
                id="description"
                className="w-full border rounded-md p-3 min-h-[140px] text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm"
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Hình ảnh sản phẩm</Label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImagesChange}
              className="block"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Tối đa 8 hình, định dạng: JPG, PNG, WEBP, GIF. Kích thước tối đa: {MAX_FILE_SIZE / 1024 / 1024}MB (ảnh sẽ được nén tự động nếu quá lớn)
            </p>
            {errors.images && (
              <p className="text-sm text-red-600">{errors.images}</p>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={src}
                    className="relative group border rounded-md overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={submitting}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags field - Currently not supported by backend
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ví dụ: miễn phí, thanh lý, đồ gỗ (cách nhau bằng dấu phẩy)"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Các từ khóa giúp người mua dễ tìm thấy sản phẩm của bạn
            </p>
          </div>
          */}

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              className="bg-[#214d8c] text-white hover:bg-[#1b3f72]"
              disabled={submitting}
            >
              {submitting ? "Đang đăng..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

