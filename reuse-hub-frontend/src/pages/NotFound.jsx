import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-2">Trang không tồn tại</h2>
      <p className="text-gray-600 mb-6">Rất tiếc, chúng tôi không thể tìm thấy trang bạn yêu cầu.</p>
      <Link to="/">
        <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all">
          Quay về Trang Chủ
        </button>
      </Link>
    </div>
  );
};

export default NotFound; 