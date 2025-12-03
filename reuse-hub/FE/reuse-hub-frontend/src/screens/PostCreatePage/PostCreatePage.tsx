import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { BeItem } from "../../components/BeItem/BeItem";
import { createItem } from "../../api/item";
import { ItemCreationRequest } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";

const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: ItemCreationRequest, images: File[]) => {
    if (!user) return;
    
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await createItem(user.id, data, images);
      console.log('Item created successfully:', response.data);
      
      // Navigate to the created item
      navigate(`/product/${response.data.id}`);
    } catch (error) {
      console.error('Error creating item:', error);
      setSubmitError('Có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#214d8c] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-4">Cần đăng nhập</h2>
          <p className="mb-4">Bạn cần đăng nhập để tạo tin đăng</p>
          <Button onClick={() => navigate('/login')} className="bg-white text-[#214d8c] hover:bg-gray-100">
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#214d8c]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Đăng tin</h1>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}
        
        <BeItem
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitting={submitting}
          submitLabel="Đăng tin"
          title="Thông tin sản phẩm"
        />
      </div>
    </div>
  );
};

export default PostCreatePage;


