import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { Header } from "../Desktop/sections/Header/Header";
import { PromotionalBannerSection } from "../Desktop/sections/PromotionalBannerSection/PromotionalBannerSection";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

// Mock data based on the image
const product = {
  id: 2,
  name: "Túi xách da Gence mới",
  price: "1.999.000 đ",
  status: "Mới",
  type: "Đồ nam",
  location: "Phường 11, Quận Gò Vấp, Tp Hồ Chí Minh",
  updatedAt: "Cập nhật 6 giờ trước",
  images: [
    "https://images.unsplash.com/photo-1590874132523-01531148b5ad?w=600&q=80",
    "https://images.unsplash.com/photo-1579631542720-3a838353e8e3?w=600&q=80",
    "https://images.unsplash.com/photo-1621484973493-135e3b5b3f4a?w=600&q=80",
    "https://images.unsplash.com/photo-1566150905458-1bf1b2969d6b?w=600&q=80",
    "https://images.unsplash.com/photo-1605733513596-2a71752d4d94?w=600&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
  ],
  description: `Túi xách Gence dành cho Nam văn phòng, sang trọng và lịch sự
Mình có đặt mua túi Gence mà do không hợp nên muốn bán lại cho ai cần thiết hơn ạ.
Túi còn mới 100%, đầy đủ phụ kiện kể cả túi bọc.
Ai quan tâm có thể gọi hoặc nt cho mình ạ. (K có zalo)
Xin cảm ơn`,
  seller: {
    name: "Đào Đức",
    avatar: "https://via.placeholder.com/40",
    activity: "Hoạt động 1 ngày trước",
    feedback: "Phản hồi --",
    itemsSold: 3,
    rating: 5,
    reviews: 1,
  },
  phone: "096554****",
};

const relatedProducts = [
  {
    id: 101,
    name: "Túi đeo chéo",
    price: "900.000 đ",
    image: "https://images.unsplash.com/photo-1547949863-c591c4d1a3a3?w=400&q=80",
    location: "Thành phố Thủ Đức",
  },
  {
    id: 102,
    name: "Túi xách da",
    price: "50.000 đ",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d12424?w=400&q=80",
    location: "Quận Gò Vấp",
  },
  {
    id: 103,
    name: "Túi xách da chéo",
    price: "150.000 đ",
    image: "https://images.unsplash.com/photo-1564422167856-7f66c837b74a?w=400&q=80",
    location: "Quận 3",
  },
  {
    id: 104,
    name: "Túi chéo nam",
    price: "1.000.000 đ",
    image: "https://images.unsplash.com/photo-1610290496426-1c2f58c13c19?w=400&q=80",
    location: "Thành phố Thủ Đức",
  },
  {
    id: 105,
    name: "Túi xách da bò thật",
    price: "160.000 đ",
    image: "https://images.unsplash.com/photo-1553062407-98eada6ce66a?w=400&q=80",
    location: "Quận 4",
  },
   {
    id: 106,
    name: "Túi xách da bò thật",
    price: "850.000 đ",
    image: "https://images.unsplash.com/photo-1591561939119-0a8b7c0641a8?w=400&q=80",
    location: "Quận 4",
  },
];


export const ProductDetailPage = (): JSX.Element => {
  const { productId } = useParams<{ productId: string }>();
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const handlePrevImage = () => {
    setMainImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setMainImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };


  return (
    <div className="bg-white w-full">
      <Header />
      <main className="container mx-auto px-28 py-8 bg-gray-100">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Image Gallery + Description */}
          <div className="col-span-2">
            {/* Image Gallery */}
            <div className="bg-white p-4 rounded-lg">
                <div className="relative">
                    <img src={product.images[mainImageIndex]} alt={product.name} className="w-full h-auto object-cover rounded-lg" />
                    <Button onClick={handlePrevImage} variant="ghost" size="icon" className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white">
                        <ChevronLeft />
                    </Button>
                    <Button onClick={handleNextImage} variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white">
                        <ChevronRight />
                    </Button>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        {mainImageIndex + 1}/{product.images.length}
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    {product.images.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={`thumbnail ${index+1}`} 
                            className={`w-16 h-16 object-cover rounded cursor-pointer ${mainImageIndex === index ? 'border-2 border-orange-500' : ''}`}
                            onClick={() => setMainImageIndex(index)}
                        />
                    ))}
                </div>
            </div>
            
            {/* Description */}
            <div className="bg-white p-4 rounded-lg mt-4">
                <Button variant="default" className="rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">Mô tả sản phẩm</Button>
                <div className="mt-4 text-gray-700 whitespace-pre-line">
                    {product.description}
                </div>
                <div className="mt-4 border-t pt-4">
                    <h3 className="font-semibold mb-2">Thông tin chi tiết</h3>
                    <div className="flex">
                        <p className="w-1/3 text-gray-500">Tình trạng</p>
                        <p className="w-2/3">{product.status}</p>
                    </div>
                     <div className="flex mt-1">
                        <p className="w-1/3 text-gray-500">Loại sản phẩm</p>
                        <p className="w-2/3">{product.type}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Product Info + Seller */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon"><Share2 size={20}/></Button>
                        <Button variant="ghost" size="icon"><MoreHorizontal size={20}/></Button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.status} - {product.type}</p>
                <p className="text-2xl font-bold text-red-500 my-2">{product.price}</p>
                <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                    <MapPin size={16} /> <span>{product.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                    <Clock size={16} /> <span>{product.updatedAt}</span>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <MessageCircle size={20} /> Chat
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Heart size={20} /> Lưu
                    </Button>
                </div>
                 <div className="mt-4 p-2 bg-gray-100 rounded-lg flex justify-between items-center">
                    <span>SĐT liên hệ: <span className="font-bold">{product.phone}</span></span>
                    <Button variant="link" className="p-0 h-auto">Hiện số</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-4">
                    <img src={product.seller.avatar} alt={product.seller.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-bold">{product.seller.name}</p>
                        <p className="text-xs text-gray-500">{product.seller.activity}</p>
                    </div>
                </div>
                <div className="flex justify-around text-center mt-4">
                    <div>
                        <p className="font-bold">{product.seller.itemsSold}</p>
                        <p className="text-sm text-gray-500">Đã bán</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 font-bold">
                            {product.seller.rating} <Star size={16} className="text-yellow-400 fill-current" />
                        </div>
                        <p className="text-sm text-gray-500">{product.seller.reviews} đánh giá</p>
                    </div>
                    <Button variant="outline">Xem trang</Button>
                </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Tin đăng tương tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {relatedProducts.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                        <h3 className="font-semibold text-sm truncate">
                        {item.name}
                        </h3>
                        <p className="text-red-500 font-bold mt-1">{item.price}</p>
                        <p className="text-gray-500 text-xs mt-1">{item.location}</p>
                    </div>
                    </Card>
                ))}
            </div>
        </div>
      </main>
      <PromotionalBannerSection />
    </div>
  );
};
