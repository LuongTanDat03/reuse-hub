import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { MapPin, Eye, Heart } from "lucide-react";
import { 
  getAllItems, 
  getPopularItems,
  searchItems,
  getAllCategories,
  formatPrice, 
  formatCount 
} from "../../../../api/item";
import { ItemSearchRequest, ItemSummaryResponse, Category } from "../../../../types/api";

const categoryImageMap: Record<string, string> = {
  "Bất động sản": "/b-t---ng-s-n.png",
  "Xe cộ": "/xe-c-.png",
  "Thú cưng": "/th--c-ng.png",
  "Đồ gia dụng": "/---gia-d-ng--n-i-th-t--c-y-c-nh.png",
  "Thể thao": "/pngtree-sports-logo-icon-picture-png-image_7179399.png",
  "Mẹ và bé": "/m--v--b-.png",
  "Dịch vụ, Du lịch": "/d-ch-v---du-l-ch.png",
  "Cho tặng miễn phí": "/cho-t-ng-mi-n-ph-.png",
  "Việc làm": "/vi-c-l-m.png",
  "Điện tử": "/----i-n-t-.png",
  "Tủ lạnh, máy lạnh, máy giặt": "/t--l-nh--m-y-l-nh--m-y-gi-t.png",
  "Đồ dùng văn phòng, công nông nghiệp": "/---d-ng-v-n-ph-ng--c-ng-n-ng-nghi-p.png",
  "Thời trang": "/th-i-trang-----d-ng-c--nh-n.png",
  "Đồ ăn, thực phẩm và các loại khác": "/----n--th-c-ph-m-v--c-c-lo-i-kh-c.png",
  "Dịch vụ chăm sóc nhà cửa": "/d-ch-v--ch-m-s-c-nh--c-a.png",
  "Sách": "gi-i-tr---th--thao--s--th-ch.png",
  "Tất cả danh mục": "/t-t-c--danh-m-c.png",
};

const DEFAULT_CATEGORY_IMAGE = "/t-t-c--danh-m-c.png";

interface ProductCardProps {
  item: ItemSummaryResponse;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const mainImage = item.images && item.images.length > 0 ? item.images[0] : "/placeholder-image.png";

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return "Tin tiêu biểu";
  };

  return (
    <Link to={`/product/${item.id}`}>
      <Card className="relative w-[219.19px] h-[364.2px] bg-white border-0 shadow-none hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-0">
          <div className="relative w-[217px] h-[362px] top-px left-px">
            {/* Image Section */}
            <div className="absolute w-[217px] h-[217px] top-0 left-0 rounded-xl overflow-hidden">
              <div className="h-[217px] rounded-sm overflow-hidden">
                <div className="w-[217px] h-[217px] relative bg-cover bg-[50%_50%]">
                  {!imageError ? (
                    <img
                      src={mainImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  
                  <div className="absolute w-[217px] h-[30px] top-[187px] left-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0)_100%)]">
                    <div className="absolute h-[18px] top-[5px] left-2.5 text-white text-xs font-bold whitespace-nowrap">
                      {getTimeAgo(new Date().toISOString())}
                    </div>

                    {item.images && item.images.length > 1 && (
                      <>
                        <div className="absolute w-[7px] h-3.5 top-[7px] left-[182px] text-white text-xs font-bold whitespace-nowrap">
                          {item.images.length}
                        </div>
                        <img
                          className="absolute w-4 h-4 top-[7px] left-[191px]"
                          alt="Image count"
                          src="/svg-1.svg"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="absolute w-[217px] h-[145px] top-[217px] left-0">
              <div className="absolute w-[209px] h-12 top-2 left-1">
                <div className="absolute w-full h-full text-[#222222] text-base leading-6 line-clamp-2">
                  {item.title}
                </div>
              </div>

              <div className="absolute h-[26px] left-1 top-[59px] text-[#f0325e] text-lg font-bold leading-[26px] whitespace-nowrap">
                {formatPrice(item.price)}
              </div>

              <div className="absolute w-[15px] h-[15px] top-[117px] left-1">
                <MapPin size={15} className="text-gray-400" />
              </div>

              <div className="absolute w-[173px] h-5 top-[116px] left-[19px]">
                <div className="absolute w-[95px] h-[18px] top-0 left-[3px] text-[#8c8c8c] text-sm leading-5 whitespace-nowrap">
                  Chưa cập nhật
                </div>
              </div>

              {/* Stats */}
              <div className="absolute top-[90px] left-1 flex gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  {formatCount(item.viewCount)}
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  {formatCount(item.likeCount)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const ProductDisplaySection = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case "popular":
            response = await getPopularItems(0, 5);
            break;
          case "new-products":
            response = await getAllItems(0, 5, "createdAt", "desc");
            break;
          default:
            response = await getAllItems(0, 5, "createdAt", "desc");
        }
        setItems(response.data.content);

      } catch (error) {
        console.error("Error loading items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [activeTab]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      return;
    }
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
  };

  return (
    <section className="flex flex-col items-center gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
      <div className="flex flex-col w-[1216px] items-start gap-[60px] relative flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-[589px] items-start gap-[60px] relative flex-[0_0_auto]">
            <div className="flex flex-col w-[525px] items-start gap-[60px] relative flex-[0_0_auto]">
              <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-white text-base tracking-[8.00px] leading-7">
                GÌ CŨNG CÓ
              </div>

              <h1 className="relative self-stretch [font-family:'Inter',Helvetica] font-black text-white text-[52px] tracking-[0] leading-[normal]">
                &#34;ĐỒ&quot; MỚI TOANH.
                <br /> KHÁM PHÁ NHANH!
              </h1>

              <p className="relative w-[186px] h-14 [font-family:'Inter',Helvetica] font-bold text-white text-base tracking-[0] leading-7">
                Mua hàng cũ với 1 chạm
                <br />
                thật dễ dàng.
              </p>
            </div>

            <div className="flex flex-col h-[66px] items-end justify-center gap-2.5 px-[9px] py-2 relative self-stretch w-full">
              <div className="flex w-[589px] h-[66px] items-center gap-2.5 px-[18px] py-[23px] absolute top-0 left-0 bg-white rounded-[15px] shadow-[6px_6px_0px_2px_#0000001a]">
                <Input
                  placeholder="Tìm sản phẩm ..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-0 bg-transparent text-[#828282] text-sm font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>

              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="flex w-[126px] h-[49px] items-center justify-center gap-2.5 px-8 py-4 relative bg-[#2661d7] rounded-[7px] hover:bg-[#2661d7]/90"
              >
                <span className="relative w-fit mt-[-1.00px] ml-[-0.50px] mr-[-0.50px] [font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
                  {loading ? "..." : "Tìm kiếm"}
                </span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
            {/* Categories */}
            <Card className="flex flex-col h-[336px] items-center justify-center gap-2.5 p-3 relative self-stretch w-full bg-white rounded-[20px] shadow-[5px_5px_0px_5px_#00000026] border-0">
              <CardContent className="flex flex-wrap w-[1180px] items-start gap-[4px_4px] relative flex-[0_0_auto] p-0">
                {loadingCategories ? (
                  <div className="flex items-center justify-center w-full h-40">
                    <div className="text-gray-500">Đang tải danh mục...</div>
                  </div>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => {
                    const categoryImage = categoryImageMap[category.name] || DEFAULT_CATEGORY_IMAGE;
                    const categoryIdentifier = category.slug || category.name;
                    return (
                      <Link
                        to={`/category/${encodeURIComponent(categoryIdentifier)}`}
                        key={category.slug}
                        className="relative w-36 h-[148px]"
                      >
                        <div className="relative h-[148px]">
                          <div
                            className="absolute w-[84px] h-[84px] top-2 left-[30px] bg-cover bg-[50%_50%]"
                            style={{ backgroundImage: `url(${categoryImage})` }}
                          />

                          <div className="absolute w-32 h-10 top-[100px] left-2">
                            <div className="absolute w-full h-full flex items-center justify-center [text-shadow:0px_0px_0px_#ffffff] [font-family:'Reddit_Sans',Helvetica] font-medium text-[#595959] text-sm text-center tracking-[0] leading-5">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center w-full h-40">
                    <div className="text-gray-500">Không có danh mục nào</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="flex flex-col w-full max-w-[1200px] items-center gap-6 p-6 bg-white rounded-[20px] shadow-[5px_5px_0px_5px_#00000026] border-0">
              <CardContent className="flex flex-col w-full items-center gap-10 p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex gap-6 bg-transparent h-auto p-0">
                    {[
                      { value: "for-you", label: "Dành cho bạn" },
                      { value: "new-products", label: "Sản phẩm mới" },
                      { value: "popular", label: "Phổ biến" }
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-8 py-3 h-12 font-bold text-lg rounded-full border-0 shadow-none bg-transparent text-[#3c75de] data-[state=active]:bg-[#3c75de] data-[state=active]:text-white"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Reusable content for all tabs */}
                  {["for-you", "new-products", "popular"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-10">
                      <div className="flex items-center gap-4 w-full">
                        {loading ? (
                          <div className="flex items-center justify-center w-full h-40">
                            <div className="text-gray-500">Đang tải...</div>
                          </div>
                        ) : items.length > 0 ? (
                          items.map((item) => <ProductCard key={item.id} item={item} />)
                        ) : (
                          <div className="flex items-center justify-center w-full h-40">
                            <div className="text-gray-500">Không có sản phẩm nào</div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <Link to="/category/tat-ca-san-pham">
                  <Button className="px-12 py-3 h-12 bg-white rounded-full border-2 border-[#cbcbcb] hover:bg-gray-50">
                    <span className="font-bold text-[#3363bd] text-sm">
                      Xem thêm
                    </span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
