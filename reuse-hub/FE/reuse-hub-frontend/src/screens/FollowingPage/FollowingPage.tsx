import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as profileAPI from '../../api/profile';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const FollowingPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (userId) {
      loadFollowing();
    }
  }, [userId, currentPage]);

  const loadFollowing = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await profileAPI.getFollowing(userId, currentPage, 20);

      if (response.status === 200 && response.data) {
        setFollowing(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    if (!confirm('Bạn có chắc muốn bỏ theo dõi người này?')) {
      return;
    }

    try {
      await profileAPI.unfollowUser(user.id, targetUserId);
      // Remove from list
      setFollowing(prev => prev.filter(u => u.id !== targetUserId));
    } catch (error) {
      console.error('Failed to unfollow:', error);
      alert('Không thể bỏ theo dõi');
    }
  };

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/profile/${userId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold">Đang theo dõi</h1>
              <p className="text-gray-600 mt-1">
                {following.length > 0 ? `${following.length} người` : 'Chưa theo dõi ai'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải..." />
          </div>
        ) : following.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Chưa theo dõi ai</h3>
            <p className="text-gray-600 mb-6">
              {isOwnProfile
                ? 'Bạn chưa theo dõi người dùng nào'
                : 'Người dùng này chưa theo dõi ai'}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Khám phá người dùng
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow divide-y">
              {following.map((followedUser) => (
                <div key={followedUser.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <button
                      onClick={() => navigate(`/profile/${followedUser.id}`)}
                      className="flex-shrink-0"
                    >
                      {followedUser.avatar ? (
                        <img
                          src={followedUser.avatar}
                          alt={followedUser.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {followedUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${followedUser.id}`)}
                        className="text-left"
                      >
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                          {followedUser.name}
                        </h3>
                        {followedUser.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {followedUser.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{followedUser.followerCount || 0} người theo dõi</span>
                          <span>{followedUser.itemCount || 0} sản phẩm</span>
                        </div>
                      </button>
                    </div>

                    {/* Unfollow Button */}
                    {isOwnProfile && (
                      <button
                        onClick={() => handleUnfollow(followedUser.id)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                      >
                        Bỏ theo dõi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;
