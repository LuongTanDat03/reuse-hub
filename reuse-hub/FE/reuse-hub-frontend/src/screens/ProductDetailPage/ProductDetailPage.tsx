import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MapPin,
  Eye,
  Share2,
  ChevronLeft,
  ChevronRight,
  User,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { 
  getItemById, 
  likeItem, 
  unlikeItem, 
  formatPrice,
  getAllItems
} from "../../api/item";
import { ItemResponse, ItemSummaryResponse } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { createTransaction } from "../../api/transaction";
import { toast } from "sonner";
import { Header } from "../Desktop/sections/Header/Header";

export const ProductDetailPage = (): JSX.Element => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [relatedItems, setRelatedItems] = useState<ItemSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [creatingTx, setCreatingTx] = useState(false);

  // Load item details
  useEffect(() => {
    const loadItem = async () => {
      if (!productId || !user) return;
      
      setLoading(true);
      try {
        const response = await getItemById(productId, user.id);
        setItem(response.data);
        
        // Load related items by category
        if (response.data.categorySlug) {
          const relatedResponse = await getAllItems(0, 6, "createdAt", "desc");
          const filteredRelated = relatedResponse.data.content
            .filter(relatedItem => 
              relatedItem.id !== productId && 
              relatedItem.categorySlug === response.data.categorySlug
            )
            .slice(0, 6);
          setRelatedItems(filteredRelated);
        }
      } catch (error) {
        console.error("Error loading item:", error);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [productId, user, navigate]);

  const handleLike = async () => {
    if (!user || !item) return;
    
    setLiking(true);
    try {
      if (item.isLiked) {
        await unlikeItem(user.id, item.id);
        setItem({ ...item, isLiked: false, likeCount: item.likeCount - 1 });
        toast.success("Đã bỏ thích");
      } else {
        await likeItem(user.id, item.id);
        setItem({ ...item, isLiked: true, likeCount: item.likeCount + 1 });
        toast.success("Đã thích sản phẩm");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setLiking(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !item) return;
    
    if (item.userId === user.id) {
      toast.error("Bạn không thể mua sản phẩm của chính mình");
      return;
    }

    setCreatingTx(true);
    try {
      const txRequest = {
        itemId: item.id,
        transactionType: 'SALE' as const,
        quantity: 1,
        price: item.price,
        deliveryMethod: 'DELIVERY' as const,
      };
      
      await createTransaction(user.id, txRequest);
      toast.success("Đã tạo giao dịch thành công!");
      navigate(`/transactions`);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Không thể tạo giao dịch");
    } finally {
      setCreatingTx(false);
    }
  };

  const handleChat = () => {
    if (!user || !item) return;
    
    if (item.userId === user.id) {
      toast.error("Bạn không thể chat với chính mình");
      return;
    }
    
    navigate(`/chat/${item.userId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        text: item?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã copy link sản phẩm");
    }
  };

  const nextImage = () => {
    if (!item?.images) return;
    setMainImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    if (!item?.images) return;
    setMainImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
          <Button onClick={() => navigate("/")} className="mt-4">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-blue-600">
            Trang chủ
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/category/${item.categorySlug}`)} 
            className="hover:text-blue-600"
          >
            {item.category}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {item.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-100">
                  {item.images && item.images.length > 0 ? (
                    <>
                      <img
                        src={item.images[mainImageIndex]}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Navigation Arrows */}
                      {item.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {mainImageIndex + 1} / {item.images.length}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-24 h-24 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {item.images && item.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {item.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                          idx === mainImageIndex
                            ? "border-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${item.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.viewCount} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.likeCount} lượt thích</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Trạng thái: <span className={`font-medium ${
                      item.status === 'AVAILABLE' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.status === 'AVAILABLE' ? 'Còn hàng' : 
                       item.status === 'SOLD' ? 'Đã bán' : 'Đã đặt trước'}
                    </span>
                  </div>
                </div>

                {/* Location */}
                {item.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 pt-4 border-t">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item.address}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  {!user ? (
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      Đăng nhập để mua hàng
                    </Button>
                  ) : item.userId === user.id ? (
                    <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
                      Đây là sản phẩm của bạn
                    </div>
                  ) : item.status !== 'AVAILABLE' ? (
                    <div className="p-4 bg-yellow-50 rounded-lg text-center text-yellow-700">
                      Sản phẩm {item.status === 'SOLD' ? 'đã bán' : 'đã được đặt trước'}
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleBuyNow}
                        disabled={creatingTx}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {creatingTx ? "Đang xử lý..." : "Mua ngay"}
                      </Button>
                      
                      <Button
                        onClick={handleChat}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat với người bán
                      </Button>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleLike}
                      disabled={liking}
                      variant="outline"
                      className="flex-1"
                    >
                      <Heart 
                        className={`w-5 h-5 mr-2 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      {item.isLiked ? 'Đã thích' : 'Thích'}
                    </Button>
                    
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="flex-1"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin người bán</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Người bán</div>
                    <div className="text-sm text-gray-500">ID: {item.userId.slice(0, 8)}...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedItems.map((relatedItem) => (
                <Card
                  key={relatedItem.id}
                  className="cursor-pointer hover:shadow-lg transition group"
                  onClick={() => navigate(`/product/${relatedItem.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {relatedItem.images && relatedItem.images[0] ? (
                        <img
                          src={relatedItem.images[0]}
                          alt={relatedItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                        {relatedItem.title}
                      </h3>
                      <div className="text-blue-600 font-bold text-sm">
                        {formatPrice(relatedItem.price)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
