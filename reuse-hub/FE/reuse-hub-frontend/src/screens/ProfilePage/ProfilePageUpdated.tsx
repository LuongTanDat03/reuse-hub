import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as profileAPI from '../../api/profile';
import * as itemsAPI from '../../api/items';
import ItemCard from '../../components/ItemCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const ProfilePageUpdated: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'reviews'>('items');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadItems();
      if (user?.id && !isOwnProfile) {
        checkFollowingStatus();
      }
    }
  }, [userId, user?.id]);

  useEffect(() => {
    if (userId) {
      if (activeTab === 'items') {
        loadItems();
      } else {
        loadReviews();
      }
    }
  }, [activeTab, currentPage, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await profileAPI.getProfile(userId);

      if (response.status === 200 && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    if (!userId) return;

    try {
      const response = await profileAPI.getUserItems(userId, currentPage, 12, 'AVAILABLE');

      if (response.status === 200 && response.data) {
        setItems(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const loadReviews = async () => {
    if (!userId) return;

    try {
      const response = await profileAPI.getUserReviews(userId, currentPage, 10);

      if (response.status === 200 && response.data) {
        setReviews(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const checkFollowingStatus = async () => {
    if (!user?.id || !userId) return;

    try {
      const response = await profileAPI.isFollowing(user.id, userId);
      if (response.status === 200 && response.data) {
        setIsFollowing(response.data.following);
      }
    } catch (error) {
      console.error('Failed to check following status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user?.id || !userId) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await profileAPI.unfollowUser(user.id, userId);
        setIsFollowing(false);
        setProfile((prev: any) => ({
          ...prev,
          followerCount: Math.max(0, (prev?.followerCount || 0) - 1),
        }));
      } else {
        await profileAPI.followUser(user.id, userId);
        setIsFollowing(true);
        setProfile((prev: any) => ({
          ...prev,
          followerCount: (prev?.followerCount || 0) + 1,
        }));
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      alert('Không thể thực hiện thao tác');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user?.id || !userId) {
      navigate('/login');
      return;
    }

    try {
      // Import chat API
      const { createOrGetChatRoom } = await import('../../api/chat');
      const room = await createOrGetChatRoom(user.id, userId);
      if (room) {
        navigate(`/chat/${room.id}`);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('Không thể tạo chat');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy người dùng</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-blue-600 to-blue-800"></div>

      <div className="container mx-auto px-4 -mt-32">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.name}
                  </h1>
                  {profile.bio && (
                    <p className="text-gray-600 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <button
                      onClick={() => navigate(`/profile/${userId}/followers`)}
                      className="hover:text-blue-600"
                    >
                      <span className="font-semibold text-gray-900">
                        {profile.followerCount || 0}
                      </span>{' '}
                      người theo dõi
                    </button>
                    <button
                      onClick={() => navigate(`/profile/${userId}/following`)}
                      className="hover:text-blue-600"
                    >
                      <span className="font-semibold text-gray-900">
                        {profile.followingCount || 0}
                      </span>{' '}
                      đang theo dõi
                    </button>
                    <span>
                      Tham gia {formatDate(profile.createdAt || new Date().toISOString())}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Chỉnh sửa profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50`}
                      >
                        {followLoading
                          ? 'Đang xử lý...'
                          : isFollowing
                          ? 'Đang theo dõi'
                          : 'Theo dõi'}
                      </button>
                      <button
                        onClick={handleContactSeller}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        💬 Nhắn tin
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.itemCount || 0}</p>
              <p className="text-sm text-gray-600">Sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.soldCount || 0}</p>
              <p className="text-sm text-gray-600">Đã bán</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {profile.rating ? profile.rating.toFixed(1) : '0.0'} ⭐
              </p>
              <p className="text-sm text-gray-600">Đánh giá</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.reviewCount || 0}</p>
              <p className="text-sm text-gray-600">Nhận xét</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab('items');
                setCurrentPage(0);
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'items'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sản phẩm ({profile.itemCount || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab('reviews');
                setCurrentPage(0);
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đánh giá ({profile.reviewCount || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'items' ? (
          <>
            {items.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2">Chưa có sản phẩm</h3>
                <p className="text-gray-600">
                  {isOwnProfile
                    ? 'Bạn chưa đăng sản phẩm nào'
                    : 'Người dùng này chưa đăng sản phẩm nào'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/post-create')}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Đăng sản phẩm ngay
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-2">Chưa có đánh giá</h3>
                <p className="text-gray-600">
                  {isOwnProfile
                    ? 'Bạn chưa nhận được đánh giá nào'
                    : 'Người dùng này chưa có đánh giá nào'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {review.reviewerAvatar ? (
                            <img
                              src={review.reviewerAvatar}
                              alt={review.reviewerName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                              {review.reviewerName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{review.reviewerName}</h4>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePageUpdated;
