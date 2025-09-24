import { useParams, Link } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  ListFilter,
  Star,
  Watch,
  Shirt,
  ShoppingBag,
  SprayCan,
  Gem,
} from "lucide-react";

import { Header } from "../Desktop/sections/Header/Header";
import { PromotionalBannerSection } from "../Desktop/sections/PromotionalBannerSection/PromotionalBannerSection";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const subCategories = [
  { name: "Quần áo", icon: <Shirt size={24} /> },
  { name: "Đồng hồ", icon: <Watch size={24} /> },
  { name: "Giày dép", icon: <SprayCan size={24} /> }, // Placeholder, no direct shoe icon
  { name: "Túi xách", icon: <ShoppingBag size={24} /> },
  { name: "Nước hoa", icon: <SprayCan size={24} /> },
  { name: "Phụ kiện thời trang", icon: <Gem size={24} /> },
];

export const CategoryPage = (): JSX.Element => {
  const { categoryName } = useParams<{ categoryName: string }>();

  // Enhanced mock data for products based on the image
  const products = [
    {
      id: 1,
      name: "[CHÍNH HÃNG][Mới 99%] Nike Blazer Jumbo, new 5tr9",
      price: "530.333 đ",
      image: "https://via.placeholder.com/300x200.png?text=Nike+Blazer",
      location: "Thành phố Thủ Đức",
      seller: "Chú CÔNG AN Bán GIÀY...",
      rating: 4.7,
      reviews: 2446,
      isNew: false,
      gender: "Cả nam và nữ",
      isPriority: true,
    },
    {
      id: 2,
      name: "Túi xách da Gence mới",
      price: "1.999.000 đ",
      image: "https://via.placeholder.com/300x200.png?text=Tui+Xach+Gence",
      location: "Quận Gò Vấp",
      seller: "Đào Đức",
      rating: 5.0,
      reviews: 3,
      isNew: true,
      gender: "Đồ nam",
      isPriority: true,
    },
    {
      id: 3,
      name: "sale toàn bộ đơn hàng nư thời trang",
      price: "18.000 đ",
      image: "https://via.placeholder.com/300x200.png?text=Sale+Thoi+Trang",
      location: "Quận Gò Vấp",
      seller: "User123",
      rating: 0,
      reviews: 0,
      isNew: false,
      gender: "Đồ nữ",
      isPriority: false,
    },
    // Add more mock products if needed
  ];

  return (
    <div className="bg-gray-100 w-full">
      <Header />
      <main className="container mx-auto px-28 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          Chợ Tốt &gt; Thời trang, Đồ dùng cá nhân &gt;{" "}
          <span className="text-gray-800 font-semibold">
            {categoryName} Tp Hồ Chí Minh
          </span>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <h1 className="text-xl font-bold mb-4">
            Thời Trang, Đồ Dùng Cá Nhân Đẹp, Đa Dạng, Giá Rẻ 2025 Tp Hồ Chí Minh
          </h1>

          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <ListFilter size={16} /> Lọc
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                Thời trang, Đồ dùng cá nhân <ChevronDown size={16} />
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                Giá <ChevronDown size={16} />
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                Tình trạng <ChevronDown size={16} />
              </Button>
            </div>
            <Button variant="ghost" className="text-sm">
              Xoá lọc
            </Button>
          </div>

          {/* Sub-category icons */}
          <div className="flex gap-8 mb-4">
            {subCategories.map((sub) => (
              <div key={sub.name} className="flex flex-col items-center gap-2">
                {sub.icon}
                <span className="text-xs">{sub.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs and Sort */}
        <div className="flex justify-between items-center my-4">
          <div className="flex gap-4 border-b">
            <Button variant="ghost" className="font-bold border-b-2 border-orange-500 rounded-none">Tất cả</Button>
            <Button variant="ghost">Cá nhân</Button>
            <Button variant="ghost">Bán chuyên</Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Dạng lưới</span>
            <Button variant="outline" className="flex items-center gap-2">
              Tin mới nhất <ChevronDown size={16} />
            </Button>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="block">
              <Card className="flex p-4 gap-4 overflow-hidden hover:bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded"
                />
                <div className="flex-grow flex flex-col">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {product.isNew ? "Mới" : "Đã sử dụng"} {product.gender}
                  </p>
                  <p className="text-red-500 font-bold text-lg my-2">
                    {product.price}
                  </p>
                  <p className="text-gray-500 text-sm mb-auto">
                    {product.location}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <img src="https://via.placeholder.com/24" alt="seller" className="rounded-full" />
                      <span>{product.seller}</span>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span>{product.rating}</span>
                          <span>({product.reviews} đã bán)</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Heart size={20} />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <PromotionalBannerSection />
    </div>
  );
};
