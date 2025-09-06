import React from 'react';

const Footer = () => {
  return (
    <div className="relative w-full bg-cover bg-center" style={{ backgroundImage: 'url(/images/footer.png)' }}>
      {/* Newsletter Section */}
      <div className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <form className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 justify-center">
            <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white drop-shadow-lg text-center lg:whitespace-nowrap">
              Đăng ký Newsletter
            </span>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Email"
                className="rounded-full px-4 py-2 sm:py-3 border border-[#28367D] outline-none w-full sm:w-56 lg:w-80 text-[#28367D] text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-[#28367D] text-white font-semibold rounded-full px-6 py-2 sm:py-3 shadow text-sm sm:text-base w-full sm:w-auto"
              >
                Nhận tin ngay
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer Information Columns */}
      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-[#28367D]">
            {/* Column 1: Logo + Contact */}
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <img src="/images/logo.png" alt="Logo" className="w-16 sm:w-20 mb-2 mx-auto sm:mx-0" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="font-semibold">Email us:</span> 
                <span className="break-all">inxinvn@gmail.com</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="font-semibold">Call:</span> 
                <span>+123 0</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="font-semibold">Working Hours:</span> 
                <span className="text-center sm:text-left">Monday - Friday, 8am - 05 pm</span>
              </div>
            </div>
            
            {/* Column 2: Quick Links 1 */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="font-bold mb-2 text-sm sm:text-base">Quick Links 1</div>
              <a href="#" className="hover:underline text-xs sm:text-sm">Home</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">About</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">Menu</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">Blog</a>
            </div>
            
            {/* Column 3: Quick Links 2 */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <div className="font-bold mb-2 text-sm sm:text-base">Quick Links 2</div>
              <a href="#" className="hover:underline text-xs sm:text-sm">My Favorites</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">My Cart</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">Login</a>
              <a href="#" className="hover:underline text-xs sm:text-sm">Pages</a>
            </div>
            
            {/* Column 4: Contact Us */}
            <div className="flex flex-col gap-3 items-center sm:items-start">
              <div className="font-bold mb-2 text-sm sm:text-base">Liên hệ với chúng tôi</div>
              <div className="flex flex-row gap-4 sm:gap-6">
                <a href="https://zalo.me/0936164744" target="_blank" rel="noopener noreferrer">
                  <img src="/images/zalo.png" alt="Zalo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-2 shadow" />
                </a>
                <a href="https://www.facebook.com/KAStarsVN" target="_blank" rel="noopener noreferrer">
                  <img src="/images/mess.png" alt="Messenger" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-2 shadow" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="w-full py-3 sm:py-4 flex justify-center items-center text-center text-xs sm:text-sm text-[#28367D] bg-transparent">
        Copyright IN XIN 2025 All Right Reserved
      </div>
    </div>
  );
};

export default Footer;