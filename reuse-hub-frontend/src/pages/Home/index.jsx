import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

// Tỉ lệ ảnh gốc (width x height):
// section_bg_1.png: 1397x768 (tỉ lệ ~0.55)
// section_bg_2.png: 1096x768 (tỉ lệ ~0.70)
// section_bg_3.png: 1386x768 (tỉ lệ ~0.55)

const Home = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#28367D' }}>
      {/* Section 1 */}
      <div
        className="w-full relative flex flex-col items-center justify-center"
        style={{
          minHeight: '55vw',
          backgroundImage: 'url(/images/section_bg_1.png)',
          backgroundSize: '100vw auto',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} className="flex justify-center">
          <Header />
        </div>
        {/* Banner ở giữa section 1 */}
       
      </div>
      
      {/* Section 2 */}
      <div
        className="w-full relative"
        style={{
          minHeight: '70vw',
          backgroundImage: 'url(/images/section_bg_2.png)',
          backgroundSize: '100vw auto',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          marginTop: '-5vw',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center pt-8 sm:pt-16 pb-6 sm:pb-12">
          <span style={{ color: '#28367D' }} className="text-sm sm:text-lg font-bold mb-2">Khám phá</span>
          <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold text-center">Danh mục sản phẩm</h2>
        </div>

        {/* Product Categories - Mobile Horizontal Scroll, Desktop Grid */}
        <div className="px-4 sm:px-8 pb-8 sm:pb-16">
          {/* Mobile: Horizontal Scroll */}
          <div className="block sm:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {/* Catalogue */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <h3 className="text-gray-800 font-semibold text-sm mb-0.5">Catalogue</h3>
                  <p className="text-[#28367D] text-xs">24 Menu</p>
                </div>
              </div>

              {/* Card visit */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <h3 className="text-gray-800 font-semibold text-sm mb-0.5">Card visit</h3>
                  <p className="text-[#28367D] text-xs">25 Menu</p>
                </div>
              </div>

              {/* Huy hiệu - Highlighted */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all relative aspect-square backdrop-blur-sm bg-blue-800/30 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1 relative">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <h3 className="text-white font-semibold text-sm">Huy hiệu</h3>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-blue-200 text-xs">35 Menu</p>
                </div>
              </div>

              {/* Bao thư */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <h3 className="text-gray-800 font-semibold text-sm mb-0.5">Bao thư</h3>
                  <p className="text-[#28367D] text-xs">24 Menu</p>
                </div>
              </div>

              {/* Quạt quảng cáo */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <h3 className="text-gray-800 font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                  <p className="text-[#28367D] text-xs">25 Menu</p>
                </div>
              </div>

              {/* Poster */}
              <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                <div className="w-24 h-24 flex items-center justify-center flex-1">
                  <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-3/4 left-2 right-2 text-center">
                  <h3 className="text-gray-800 font-semibold text-sm mb-0.5">Poster</h3>
                  <p className="text-[#28367D] text-xs">22 Menu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Catalogue */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">Catalogue</h3>
                <p className="text-[#28367D] text-xs sm:text-sm">24 Menu</p>
              </div>
            </div>

            {/* Card visit */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">Card visit</h3>
                <p className="text-[#28367D] text-xs sm:text-sm">25 Menu</p>
              </div>
            </div>

            {/* Huy hiệu - Highlighted */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all relative aspect-square backdrop-blur-sm bg-blue-800/30 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1 relative">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <div className="flex items-center gap-1 justify-center">
                  <h3 className="text-white font-semibold text-sm sm:text-base">Huy hiệu</h3>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-200 text-xs sm:text-sm">35 Menu</p>
              </div>
            </div>

            {/* Bao thư */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">Bao thư</h3>
                <p className="text-[#28367D] text-xs sm:text-sm">24 Menu</p>
              </div>
            </div>

            {/* Quạt quảng cáo */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">Quạt quảng cáo</h3>
                <p className="text-[#28367D] text-xs sm:text-sm">25 Menu</p>
              </div>
            </div>

            {/* Poster */}
            <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
              </div>
              <div className="absolute top-3/4 left-2 right-2 text-center">
                <h3 className="text-gray-800 font-semibold text-sm sm:text-base mb-0.5">Poster</h3>
                <p className="text-[#28367D] text-xs sm:text-sm">22 Menu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Xem thêm Button */}
        <div className="hidden sm:flex justify-center mt-4 sm:mt-6 pb-8 sm:pb-16">
          <button className="backdrop-blur-sm bg-white/20 text-blue-600 border border-blue-600 rounded-full px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium hover:bg-blue-50/30 hover:shadow-xl transition-all shadow-lg">
            xem thêm
          </button>
        </div>
      </div>
      {/* Section 3 */}
      <div
        className="w-full flex items-center justify-center"
        style={{
          minHeight: '55vw',
          backgroundImage: 'url(/images/section_bg_3.png)',
          backgroundSize: '100vw auto',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          marginTop: '-11vw',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-12 gap-y-6 sm:gap-y-32 w-full max-w-6xl h-full items-center justify-center px-2 sm:px-0">
          {/* Ô 1 */}
          <div className="h-10 sm:h-80 flex flex-col items-center justify-center max-w-full w-full px-1 sm:px-10 text-center">
            <span style={{ color: '#B4D334' }} className="text-xs sm:text-4xl md:text-6xl font-bold leading-tight text-center">
              Quạt quảng cáo
            </span>
            <span className="text-white text-[10px] sm:text-xl md:text-3xl font-normal mt-1 sm:mt-4 text-center">In chất lượng cao theo yêu cầu</span>
            <div className="flex flex-row items-center gap-2 sm:gap-8 mt-1 sm:mt-8 justify-center w-full">
              <img src="/images/image 15.png" alt="Resize" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
              <img src="/images/image 16.png" alt="Gia công" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
              <img src="/images/image 17.png" alt="In 2 mặt" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
            </div>
          </div>
          {/* Ô 2 */}
          <div className="h-10 sm:h-80 flex items-center justify-center max-w-full w-full px-1 sm:px-10 text-center">
            <img src="/images/banner_fan.png" alt="Fan Kas Trip 2024" className="max-h-16 sm:max-h-80 md:max-h-[28rem] w-auto object-contain" />
          </div>
          {/* Ô 3 giống ô 2 */}
          <div className="h-10 sm:h-80 flex items-center justify-center max-w-full w-full px-1 sm:px-10 text-center">
            <img src="/images/banner_fan.png" alt="Fan Kas Trip 2024" className="max-h-16 sm:max-h-80 md:max-h-[28rem] w-auto object-contain" />
          </div>
          {/* Ô 4 giống ô 1 */}
          <div className="h-10 sm:h-80 flex flex-col items-center justify-center max-w-full w-full px-1 sm:px-10 text-center">
            <span style={{ color: '#B4D334' }} className="text-xs sm:text-4xl md:text-6xl font-bold leading-tight text-center">
              Quạt quảng cáo
            </span>
            <span className="text-white text-[10px] sm:text-xl md:text-3xl font-normal mt-1 sm:mt-4 text-center">In chất lượng cao theo yêu cầu</span>
            <div className="flex flex-row items-center gap-2 sm:gap-8 mt-1 sm:mt-8 justify-center w-full">
              <img src="/images/image 15.png" alt="Resize" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
              <img src="/images/image 16.png" alt="Gia công" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
              <img src="/images/image 17.png" alt="In 2 mặt" className="h-6 w-6 sm:h-16 sm:w-16 object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 */}
      <div
        className="w-full"
        style={{
          minHeight: '60vw',
          backgroundColor: '#28367D',
          marginTop: '5vw',
          position: 'relative',
          zIndex: 4,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-10">
          {/* Phần 1: Sản phẩm khuyến mãi */}
          <div className="mb-16 sm:mb-24">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-white text-sm sm:text-lg font-medium mb-2 block">Sản phẩm</span>
              <h2 style={{ color: '#B4D334' }} className="text-2xl sm:text-4xl md:text-5xl font-bold">Các sản phẩm khuyến mãi</h2>
            </div>

            {/* Product Slider */}
            <div className="relative">
              {/* Navigation Arrows */}
              <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition-colors">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 sm:p-3 transition-colors">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Products - Mobile Horizontal Scroll, Desktop Grid */}
              {/* Mobile: Horizontal Scroll */}
              <div className="block sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-4">
                  {/* Product Card 1 */}
                  <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                    <div className="w-24 h-24 flex items-center justify-center flex-1">
                      <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-3/4 left-2 right-2 text-center">
                      <h3 className="text-white font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                      <p className="text-[#B4D334] text-xs">25.000₫</p>
                    </div>
                  </div>
                  {/* Product Card 2 */}
                  <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                    <div className="w-24 h-24 flex items-center justify-center flex-1">
                      <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-3/4 left-2 right-2 text-center">
                      <h3 className="text-white font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                      <p className="text-[#B4D334] text-xs">25.000₫</p>
                    </div>
                  </div>
                  {/* Product Card 3 */}
                  <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                    <div className="w-24 h-24 flex items-center justify-center flex-1">
                      <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-3/4 left-2 right-2 text-center">
                      <h3 className="text-white font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                      <p className="text-[#B4D334] text-xs">25.000₫</p>
                    </div>
                  </div>
                  {/* Product Card 4 */}
                  <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                    <div className="w-24 h-24 flex items-center justify-center flex-1">
                      <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-3/4 left-2 right-2 text-center">
                      <h3 className="text-white font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                      <p className="text-[#B4D334] text-xs">25.000₫</p>
                    </div>
                  </div>
                  {/* Product Card 5 */}
                  <div className="rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg flex-shrink-0 w-36" style={{ border: '2px solid #B4D334' }}>
                    <div className="w-24 h-24 flex items-center justify-center flex-1">
                      <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute top-3/4 left-2 right-2 text-center">
                      <h3 className="text-white font-semibold text-sm mb-0.5">Quạt quảng cáo</h3>
                      <p className="text-[#B4D334] text-xs">25.000₫</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-8">
                {/* Product Card 1 */}
                <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
                  <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                    <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute top-3/4 left-2 right-2 text-center">
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5">Quạt quảng cáo</h3>
                    <p className="text-[#B4D334] text-xs sm:text-sm">25.000₫</p>
                  </div>
                </div>
                {/* Product Card 2 */}
                <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
                  <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                    <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute top-3/4 left-2 right-2 text-center">
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5">Quạt quảng cáo</h3>
                    <p className="text-[#B4D334] text-xs sm:text-sm">25.000₫</p>
                  </div>
                </div>
                {/* Product Card 3 */}
                <div className="rounded-xl p-2 sm:p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all aspect-square relative backdrop-blur-sm bg-white/20 shadow-lg" style={{ border: '2px solid #B4D334' }}>
                  <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-1">
                    <img src="/images/banner_fan.png" alt="Fan" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute top-3/4 left-2 right-2 text-center">
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5">Quạt quảng cáo</h3>
                    <p className="text-[#B4D334] text-xs sm:text-sm">25.000₫</p>
                  </div>
                </div>
              </div>

              {/* Xem tất cả Button */}
              <div className="flex justify-center mt-8 sm:mt-12">
                <button className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium hover:bg-white hover:text-gray-800 transition-colors">
                  Xem tất cả
                </button>
              </div>
            </div>
          </div>

          {/* Phần 2: Khách hàng đánh giá */}
          <div>
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-white text-sm sm:text-base mb-2">Sự hài lòng của khách hàng là động lực để chúng tôi không ngừng cải thiện dịch vụ</p>
              <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold">Khách hàng đánh giá</h2>
            </div>

            {/* Review Card */}
            <div className="max-w-4xl mx-auto">
              <div style={{ backgroundColor: '#B4D334' }} className="rounded-2xl p-6 sm:p-8 text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-400 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Rất tốt!</h3>
                
                {/* Stars */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-white text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                {/* Reviewer Name */}
                <p className="text-white font-medium text-sm sm:text-base">Trajan Fox</p>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Custom CSS for hiding scrollbar on mobile */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
