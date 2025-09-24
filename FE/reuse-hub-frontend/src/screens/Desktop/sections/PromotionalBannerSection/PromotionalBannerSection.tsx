
export const PromotionalBannerSection = (): JSX.Element => {
  const customerSupportLinks = [
    "Trung tâm trợ giúp",
    "An toàn mua bán",
    "Liên hệ hỗ trợ",
  ];

  const aboutLinks = [
    "Giới thiệu",
    "Quy chế hoạt động sàn",
    "Chính sách bảo mật",
    "Giải quyết tranh chấp",
    "Tuyển dụng",
    "Truyền thông",
    "Blog",
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      image: "/item---link---linkedin.png",
    },
    {
      name: "YouTube",
      image: "/item---link---youtube.png",
    },
    {
      name: "Facebook",
      image: "/item---link---facebook.png",
    },
  ];

  return (
    <footer className="flex flex-col items-start gap-3 px-[109px] py-[30px] w-full bg-[#3c75de]">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-4 gap-[100px]">
          {/* App Download Section */}
          <div className="flex flex-col gap-6">
            <h3 className="[font-family:'Reddit_Sans',Helvetica] font-bold text-white text-sm tracking-[0] leading-5">
              Tải ứng dụng Chợ Tốt
            </h3>
            <div className="flex gap-4 items-start">
              <div className="w-[87px] h-[87px] bg-[url(/picture---ch--t-t.png)] bg-cover bg-[50%_50%] flex-shrink-0" />
              <div className="flex flex-col gap-4">
                <div className="w-[116px] h-[39px] bg-[url(/item---link---app-store.png)] bg-cover bg-[50%_50%]" />
                <div className="w-[116px] h-[39px] bg-[url(/item---link---google-play.png)] bg-cover bg-[50%_50%]" />
              </div>
            </div>
          </div>

          {/* Customer Support Section */}
          <div className="flex flex-col gap-6">
            <h3 className="[font-family:'Reddit_Sans',Helvetica] font-bold text-white text-sm tracking-[0] leading-5">
              Hỗ trợ khách hàng
            </h3>
            <div className="flex flex-col gap-4">
              {customerSupportLinks.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="[font-family:'Reddit_Sans',Helvetica] font-normal text-blue-200 text-sm tracking-[0] leading-5 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="flex flex-col gap-6">
            <h3 className="[font-family:'Reddit_Sans',Helvetica] font-bold text-white text-sm tracking-[0] leading-5">
              Về Chợ Tốt
            </h3>
            <div className="flex flex-col gap-4">
              {aboutLinks.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="[font-family:'Reddit_Sans',Helvetica] font-normal text-blue-200 text-sm tracking-[0] leading-5 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Links and Contact Section */}
          <div className="flex flex-col gap-6">
            <h3 className="[font-family:'Reddit_Sans',Helvetica] font-bold text-white text-sm tracking-[0] leading-5">
              Liên kết
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-8 h-8 bg-cover bg-[50%_50%] hover:opacity-80 transition-opacity"
                    style={{ backgroundImage: `url(${social.image})` }}
                    aria-label={social.name}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-4 mt-2">
                <p className="[font-family:'Reddit_Sans',Helvetica] font-normal text-blue-200 text-sm tracking-[0] leading-5">
                  Email: trogiup@chotot.vn
                </p>
                <p className="[font-family:'Reddit_Sans',Helvetica] font-normal text-blue-200 text-sm tracking-[0] leading-5">
                  CSKH: 19003003(1.000đ/phút)
                </p>
                <address className="[font-family:'Reddit_Sans',Helvetica] font-normal text-blue-200 text-sm tracking-[0] leading-5 not-italic">
                  Địa chỉ: Tầng 18, Toà nhà UOA, Số 6 đường Tân
                  <br />
                  Trào, Phường Tân Mỹ, Thành phố Hồ Chí Minh,
                  <br />
                  Việt Nam
                </address>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-4">
          <div className="[font-family:'Inter',Helvetica] text-xs text-center text-blue-200">
            <strong>Công ty TNHH Shopee</strong>
            <br />
            Địa chỉ: Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành
            phố Hà Nội, Việt Nam.
            <br />
            Chăm sóc khách hàng: Gọi tổng đài Shopee (miễn phí) hoặc Trò chuyện với Shopee ngay trên Trung tâm trợ
            giúp
            <br />
            <strong>Chịu Trách Nhiệm Quản Lý Nội Dung:</strong> Nguyễn Bui Anh Tuân
            <br />
            <strong>Mã số doanh nghiệp:</strong> 0106773786 do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày
            10/02/2015
            <br />© 2015 - Bản quyền thuộc về Công ty TNHH Shopee
          </div>
        </div>
      </div>
    </footer>
  );
};
