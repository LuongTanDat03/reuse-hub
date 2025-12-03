import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as profileAPI from '../../api/profile';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const FollowersPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [followingStatus, setFollowingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (userId) {
      loadFollowers();
    }
  }, [userId, currentPage]);

  const loadFollowers = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await profileAPI.getFollowers(userId, currentPage, 20);

      if (response.status === 200 && response.data) {
        setFollowers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);

        // Check following status for each follower
        if (user?.id) {
          const statusMap: { [key: string]: boolean } = {};
          for (const follower of response.data.content || []) {
            try {
              const statusResponse = await profileAPI.isFollowing(user.id, follower.id);
              if (statusResponse.status === 200 && statusResponse.data) {
                statusMap[follower.id] = statusResponse.data.following;
              }
            } catch (error) {
              console.error('Failed to check following status:', error);
            }
          }
          setFollowingStatus(statusMap);
        }
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    try {
      const isFollowing = followingStatus[targetUserId];

      if (isFollowing) {
        await profileAPI.unfollowUser(user.id, targetUserId);
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await profileAPI.followUser(user.id, targetUserId);
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      alert('Không thể thực hiện thao tác');
    }
  };

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
              <h1 className="text-3xl font-bold">Người theo dõi</h1>
              <p className="text-gray-600 mt-1">
                {followers.length > 0 ? `${followers.length} người` : 'Chưa có người theo dõi'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải..." />
          </div>
        ) : followers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Chưa có người theo dõi</h3>
            <p className="text-gray-600">
              Người dùng này chưa có người theo dõi nào
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow divide-y">
              {followers.map((follower) => (
                <div key={follower.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <button
                      onClick={() => navigate(`/profile/${follower.id}`)}
                      className="flex-shrink-0"
                    >
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={follower.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {follower.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${follower.id}`)}
                        className="text-left"
                      >
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                          {follower.name}
                        </h3>
                        {follower.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {follower.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{follower.followerCount || 0} người theo dõi</span>
                          <span>{follower.itemCount || 0} sản phẩm</span>
                        </div>
                      </button>
                    </div>

                    {/* Follow Button */}
                    {user?.id !== follower.id && (
                      <button
                        onClick={() => handleFollow(follower.id)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          followingStatus[follower.id]
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {followingStatus[follower.id] ? 'Đang theo dõi' : 'Theo dõi'}
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

export default FollowersPage;
