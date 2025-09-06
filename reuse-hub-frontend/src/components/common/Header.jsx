import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const Header = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="w-full text-white py-4 px-4 sm:px-6" style={{ backgroundColor: '#28367D' }}>
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-16">
        {/* Left menu */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          <Link to="/" className="hover:underline text-sm lg:text-base">Trang chủ</Link>
          <Link to="/products" className="hover:underline text-sm lg:text-base">Sản phẩm</Link>
        </div>

        {/* Logo center */}
        <div className="mx-4 lg:mx-12">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-16 lg:h-20 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right menu */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          <a href="#" className="hover:underline text-sm lg:text-base">Khuyến mãi</a>
          <a href="#" className="hover:underline text-sm lg:text-base">Tra cứu đơn hàng</a>
      
          {/* Cart Icon */}
          <Link to="/cart" className="relative hover:text-yellow-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L14 18M14 18a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            <Link to="/">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right side - Cart and Menu */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link to="/cart" className="relative hover:text-yellow-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L14 18M14 18a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-3 pt-4">
              <Link to="/" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
              <Link to="/products" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Sản phẩm</Link>
              <a href="#" className="hover:underline text-sm">Khuyến mãi</a>
              <a href="#" className="hover:underline text-sm">Tra cứu đơn hàng</a>
            </div>  
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 