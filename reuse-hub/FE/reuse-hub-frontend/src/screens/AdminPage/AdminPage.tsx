import React, { useEffect, useState } from 'react';
import { getAllItems, createItem, updateItem, deleteItem, formatPrice, getAllCategories } from '../../api/item';
import { ItemResponse, ItemCreationRequest, Category } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { BeItem } from '../../components/BeItem/BeItem';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Eye, Heart, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Debug logging
  console.log('AdminPage - isAuthenticated:', isAuthenticated, 'user:', user);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchItems();
    } else if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để xem trang quản trị.');
      setLoading(false);
    } else if (!user?.id) {
      setError('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getAllItems(0, 100); // Fetch first 100 items for simplicity
      if (response.status === 200 && response.data) {
        setItems(response.data.content);
      } else {
        setError(response.message || 'Lỗi khi tải danh sách sản phẩm.');
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ItemCreationRequest, images: File[]) => {
    if (!user?.id) {
      toast.error('Người dùng chưa đăng nhập.');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        const response = await updateItem(user.id, editingItem.id, data, images.length > 0 ? images : undefined);
        if (response.status === 200 && response.data) {
          toast.success('Sản phẩm đã cập nhật thành công!');
          fetchItems();
          resetForm();
        } else {
          toast.error(response.message || 'Lỗi khi cập nhật sản phẩm.');
        }
      } else {
        // Create new item
        const response = await createItem(user.id, data, images);
        if (response.status === 200 && response.data) {
          toast.success('Sản phẩm đã tạo thành công!');
          fetchItems();
          resetForm();
        } else {
          toast.error(response.message || 'Lỗi khi tạo sản phẩm.');
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi xử lý sản phẩm:', err);
      if (err?.response?.status === 413) {
        toast.error('Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc đợi hệ thống nén tự động.');
      } else {
        toast.error(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user?.id) {
      toast.error('Người dùng chưa đăng nhập.');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      return;
    }
    try {
      const response = await deleteItem(user.id, itemId);
      if (response.status === 200) {
        toast.success('Sản phẩm đã xóa thành công!');
        fetchItems();
      } else {
        toast.error(response.message || 'Lỗi khi xóa sản phẩm.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      toast.error('Không thể xóa sản phẩm.');
    }
  };

  const handleEditClick = (item: ItemResponse) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}
          >
            {showForm ? 'Đóng Form' : '+ Thêm Sản phẩm Mới'}
          </Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <BeItem
              initialData={editingItem ? {
                title: editingItem.title,
                description: editingItem.description,
                tags: editingItem.tags,
                categoryId: categories.find(cat => cat.name === editingItem.category)?.id || '',
                price: editingItem.price,
                address: editingItem.address || '',
                location: editingItem.location,
              } : undefined}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              submitting={submitting}
              submitLabel={editingItem ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm'}
              title={editingItem ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
            />
          </div>
        )}

        {/* Product Listing */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/product/${item.id}`}>
                  <div className="relative aspect-square">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'AVAILABLE' ? 'bg-green-500 text-white' :
                        item.status === 'SOLD' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-500 font-bold text-lg">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      {item.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      {item.likeCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {item.commentCount}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditClick(item)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit size={16} className="mr-1" />
                      Sửa
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nào</p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              Thêm sản phẩm đầu tiên
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
