import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

const categories = [
  {
    image: "/b-t---ng-s-n.png",
    label: "Bất động sản",
  },
  {
    image: "/xe-c-.png",
    label: "Xe cộ",
  },
  {
    image: "/th--c-ng.png",
    label: "Thú cưng",
  },
  {
    image: "/---gia-d-ng--n-i-th-t--c-y-c-nh.png",
    label: "Đồ gia dụng, nội thất, cây cảnh",
  },
  {
    image: "/gi-i-tr---th--thao--s--th-ch.png",
    label: "Giải trí, Thể thao, Sở thích",
  },
  {
    image: "/m--v--b-.png",
    label: "Mẹ và bé",
  },
  {
    image: "/d-ch-v---du-l-ch.png",
    label: "Dịch vụ, Du lịch",
  },
  {
    image: "/cho-t-ng-mi-n-ph-.png",
    label: "Cho tặng miễn phí",
  },
  {
    image: "/vi-c-l-m.png",
    label: "Việc làm",
  },
  {
    image: "/----i-n-t-.png",
    label: "Đồ điện tử",
  },
  {
    image: "/t--l-nh--m-y-l-nh--m-y-gi-t.png",
    label: "Tủ lạnh, máy lạnh, máy giặt",
  },
  {
    image: "/---d-ng-v-n-ph-ng--c-ng-n-ng-nghi-p.png",
    label: "Đồ dùng văn phòng, công nông nghiệp",
  },
  {
    image: "/th-i-trang-----d-ng-c--nh-n.png",
    label: "Thời trang, Đồ dùng cá nhân",
  },
  {
    image: "/----n--th-c-ph-m-v--c-c-lo-i-kh-c.png",
    label: "Đồ ăn, thực phẩm và các loại khác",
  },
  {
    image: "/d-ch-v--ch-m-s-c-nh--c-a.png",
    label: "Dịch vụ chăm sóc nhà cửa",
    hasNewBadge: true,
  },
  {
    image: "/t-t-c--danh-m-c.png",
    label: "Tất cả danh mục",
  },
];

const products = [
  {
    image:
      "/--i-n-i-th-t-c-n-pass--mua-b-n-gi--ng--ch-n-ga-g-i-n-m-t-i-qu-n-.png",
    title: "đổi nội thất cần pass",
    price: "1.500.000 đ",
    location: "Tp Hồ Chí Minh",
    timeAgo: "10 giây trước",
    imageCount: null,
  },
  {
    image:
      "/--iphone-15-promax--kh-ng-b-o--o--g-p-0---ng--mua-b-n--i-n-tho-i.png",
    title: "🍎Iphone 15 ProMax🍎Không báo ảo🍎Góp 0 đồng",
    subtitle: "iPhone 15 Pro Max - 512 GB - 4-…",
    price: "20.500.000 đ",
    location: "Tp Hồ Chí Minh",
    timeAgo: "Tin tiêu biểu",
    imageCount: "5",
  },
  {
    image:
      "/iphone-12-prm-128g-v-ng-qte-m---mua-b-n--i-n-tho-i-t-i-th-nh-ph-.png",
    title: "iPhone 12 prm 128G vàng qte mỹ",
    price: "9.500.000 đ",
    location: "Đồng Nai",
    timeAgo: "10 giây trước",
    imageCount: "6",
  },
  {
    image:
      "/winner-150cc-bs-85e1-14473--mua-b-n-xe-m-y-t-i-qu-n-ph--nhu-n-tp.png",
    title: "WINNER 150CC BS 85E1-14473",
    price: "15.800.000 đ",
    location: "Tp Hồ Chí Minh",
    timeAgo: "10 giây trước",
    imageCount: "5",
  },
  {
    image:
      "/tuy-n-nh-n-vi-n-b-n-h-ng-28k-h--vi-c-l-m-t-i-qu-n-g--v-p-tp-h--c.png",
    title: "Tuyển nhân viên bán hàng 28k/h",
    price: "Đến 28.000 đ/giờ",
    location: "Tp Hồ Chí Minh",
    timeAgo: "10 giây trước",
    imageCount: null,
  },
];

export const ProductDisplaySection = (): JSX.Element => {
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
                  className="border-0 bg-transparent text-[#828282] text-sm [font-family:'Inter',Helvetica] font-bold focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
              </div>

              <Button className="flex w-[126px] h-[49px] items-center justify-center gap-2.5 px-8 py-4 relative bg-[#2661d7] rounded-[7px] hover:bg-[#2661d7]/90">
                <span className="relative w-fit mt-[-1.00px] ml-[-0.50px] mr-[-0.50px] [font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
                  Tìm kiếm
                </span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[60px] relative self-stretch w-full flex-[0_0_auto]">
            <Card className="flex flex-col h-[336px] items-center justify-center gap-2.5 p-3 relative self-stretch w-full bg-white rounded-[20px] shadow-[5px_5px_0px_5px_#00000026] border-0">
              <CardContent className="flex flex-wrap w-[1180px] items-start gap-[4px_4px] relative flex-[0_0_auto] p-0">
                {categories.map((category, index) => (
                  <Link
                    to={`/category/${encodeURIComponent(category.label)}`}
                    key={index}
                    className="relative w-36 h-[148px]"
                  >
                    <div className="relative h-[148px]">
                      <div
                        className="absolute w-[84px] h-[84px] top-2 left-[30px] bg-cover bg-[50%_50%]"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />

                      <div className="absolute w-32 h-10 top-[100px] left-2">
                        <div className="absolute w-full h-full flex items-center justify-center [text-shadow:0px_0px_0px_#ffffff] [font-family:'Reddit_Sans',Helvetica] font-medium text-[#595959] text-sm text-center tracking-[0] leading-5">
                          {category.label}
                        </div>
                      </div>

                      {category.hasNewBadge && (
                        <img
                          className="absolute w-[30px] h-5 top-0 left-[90px]"
                          alt="New cat svg"
                          src="/new-cat-v2-svg.svg"
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="flex flex-col w-[1200px] h-[593px] items-center justify-around gap-2.5 p-3 relative bg-white rounded-[20px] shadow-[5px_5px_0px_5px_#00000026] border-0">
              <CardContent className="flex flex-col w-[1159.95px] items-center gap-10 relative flex-[0_0_auto] p-0">
                <div className="flex flex-col items-start gap-10 relative self-stretch w-full flex-[0_0_auto]">
                  <Tabs defaultValue="for-you" className="w-full">
                    <TabsList className="inline-flex items-center gap-[22px] relative flex-[0_0_auto] bg-transparent h-auto p-0">
                      <TabsTrigger
                        value="for-you"
                        className="flex w-48 h-[49px] items-center justify-center gap-2.5 px-[35px] py-3 relative bg-[#3c75de] rounded-[50px] data-[state=active]:bg-[#3c75de] data-[state=inactive]:bg-transparent border-0 shadow-none"
                      >
                        <span className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-bold text-white text-lg tracking-[0] leading-[normal]">
                          Dành cho bạn
                        </span>
                      </TabsTrigger>

                      <TabsTrigger
                        value="new-products"
                        className="relative w-fit [font-family:'Inter',Helvetica] font-bold text-[#3c75de] text-lg tracking-[0] leading-[normal] bg-transparent border-0 shadow-none data-[state=active]:bg-[#3c75de] data-[state=active]:text-white data-[state=active]:rounded-[50px] px-[35px] py-3 h-[49px]"
                      >
                        Sản phẩm mới
                      </TabsTrigger>

                      <TabsTrigger
                        value="recent"
                        className="relative w-fit [font-family:'Inter',Helvetica] font-bold text-[#3c75de] text-lg tracking-[0] leading-[normal] bg-transparent border-0 shadow-none data-[state=active]:bg-[#3c75de] data-[state=active]:text-white data-[state=active]:rounded-[50px] px-[35px] py-3 h-[49px]"
                      >
                        Gần đây
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="for-you" className="mt-10">
                      <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                        {products.map((product, index) => (
                          <Card
                            key={index}
                            className="relative w-[219.19px] h-[364.2px] bg-white border-0 shadow-none"
                          >
                            <CardContent className="p-0">
                              <div className="relative w-[217px] h-[362px] top-px left-px">
                                <div className="absolute w-[217px] h-[217px] top-0 left-0 rounded-xl overflow-hidden">
                                  <div className="h-[217px] rounded-sm overflow-hidden">
                                    <div
                                      className="w-[217px] h-[217px] relative bg-cover bg-[50%_50%]"
                                      style={{
                                        backgroundImage: `url(${product.image})`,
                                      }}
                                    >
                                      <div className="absolute w-6 h-6 top-3 left-[181px] bg-[url(/svg-3.svg)] bg-[100%_100%]">
                                        <img
                                          className="absolute w-6 h-6 top-0 left-0"
                                          alt="Svg"
                                          src="/svg-5.svg"
                                        />
                                      </div>

                                      <div className="absolute w-[217px] h-[30px] top-[187px] left-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0)_100%)]">
                                        <div className="absolute h-[18px] top-[5px] left-2.5 [font-family:'Reddit_Sans',Helvetica] font-bold text-white text-xs tracking-[0] leading-[18px] whitespace-nowrap">
                                          {product.timeAgo}
                                        </div>

                                        {product.imageCount && (
                                          <>
                                            <div className="absolute w-[7px] h-3.5 top-[7px] left-[182px] [font-family:'Reddit_Sans',Helvetica] font-bold text-white text-xs tracking-[0] leading-[13.8px] whitespace-nowrap">
                                              {product.imageCount}
                                            </div>
                                            <img
                                              className="absolute w-4 h-4 top-[7px] left-[191px]"
                                              alt="Svg"
                                              src="/svg-1.svg"
                                            />
                                          </>
                                        )}

                                        {!product.imageCount &&
                                          product.timeAgo ===
                                            "10 giây trước" && (
                                            <img
                                              className="absolute w-4 h-4 top-[7px] left-[191px]"
                                              alt="Svg"
                                              src="/svg-2.svg"
                                            />
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="absolute w-[217px] h-[145px] top-[217px] left-0">
                                  <div className="absolute w-[209px] h-12 top-2 left-1">
                                    <div className="absolute w-full h-full [font-family:'Reddit_Sans',Helvetica] font-normal text-[#222222] text-base tracking-[0] leading-6">
                                      {product.title}
                                    </div>
                                  </div>

                                  {product.subtitle && (
                                    <div className="absolute w-[210px] h-5 top-[60px] left-1">
                                      <div className="absolute w-full h-[18px] top-0 left-0 [font-family:'Reddit_Sans',Helvetica] font-normal text-[#8c8c8c] text-sm tracking-[0] leading-[20.0px] whitespace-nowrap">
                                        {product.subtitle}
                                      </div>
                                    </div>
                                  )}

                                  <div
                                    className={`absolute h-[26px] left-1 [font-family:'Reddit_Sans',Helvetica] font-bold text-[#f0325e] text-lg tracking-[0] leading-[26px] whitespace-nowrap ${product.subtitle ? "top-[83px]" : "top-[59px]"}`}
                                  >
                                    {product.price}
                                  </div>

                                  <img
                                    className="absolute w-[15px] h-[15px] top-[117px] left-1"
                                    alt="Svg"
                                    src="/svg.svg"
                                  />

                                  <div className="absolute w-[173px] h-5 top-[116px] left-[19px]">
                                    <div className="absolute w-[95px] h-[18px] top-0 left-[3px] [font-family:'Reddit_Sans',Helvetica] font-normal text-[#8c8c8c] text-sm tracking-[0] leading-5 whitespace-nowrap">
                                      {product.location}
                                    </div>
                                  </div>

                                  <img
                                    className="absolute w-5 h-6 top-[113px] left-[193px]"
                                    alt="Background"
                                    src="/background.svg"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="new-products" className="mt-10">
                      <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                        {/* Same product grid structure for new products */}
                      </div>
                    </TabsContent>

                    <TabsContent value="recent" className="mt-10">
                      <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                        {/* Same product grid structure for recent products */}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button className="flex w-[359px] h-[49px] items-center justify-center gap-2.5 px-36 py-4 relative bg-white rounded-[50px] border-2 border-solid border-[#cbcbcb] hover:bg-gray-50">
                  <span className="relative w-fit mt-[-2.00px] [font-family:'Inter',Helvetica] font-bold text-[#3363bd] text-sm tracking-[0] leading-[normal]">
                    Xem thêm
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <img
        className="relative self-stretch w-full h-[576px] object-cover"
        alt="Image"
        src="/image-17.png"
      />
    </section>
  );
};
