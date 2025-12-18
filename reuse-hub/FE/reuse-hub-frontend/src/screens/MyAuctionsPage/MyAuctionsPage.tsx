import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { AuctionCard } from '../../components/Auction/AuctionCard';
import { AuctionResponse } from '../../types/auction';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAuctionsBySeller,
  getMyBiddingAuctions,
  getWonAuctions,
} from '../../api/auction';

type TabType = 'my-auctions' | 'my-bids' | 'won';

export const MyAuctionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('my-auctions');
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchAuctions = async (reset = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      let response;

      switch (activeTab) {
        case 'my-bids':
          response = await getMyBiddingAuctions(user.id, currentPage, 12);
          break;
        case 'won':
          response = await getWonAuctions(user.id, currentPage, 12);
          break;
        default:
          response = await getAuctionsBySeller(user.id, currentPage, 12);
      }

      if (response.status === 200 && response.data) {
        const newAuctions = response.data.content;
        setAuctions(reset ? newAuctions : [...auctions, ...newAuctions]);
        setHasMore(!response.data.last);
        if (reset) setPage(0);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error('Không thể tải danh sách đấu giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAuctions(true);
    }
  }, [activeTab, user]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setAuctions([]);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchAuctions();
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'my-bids':
        return 'Đấu giá đang tham gia';
      case 'won':
        return 'Đấu giá đã thắng';
      default:
        return 'Phiên đấu giá của tôi';
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'my-bids':
        return 'Bạn chưa tham gia đấu giá nào';
      case 'won':
        return 'Bạn chưa thắng đấu giá nào';
      default:
        return 'Bạn chưa tạo phiên đấu giá nào';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔨 Quản lý đấu giá</h1>
              <p className="text-gray-600">{getTabTitle()}</p>
            </div>
            <Button
              onClick={() => navigate('/auction/create')}
              className="bg-[#214d8c] hover:bg-[#1a3d6e]"
            >
              + Tạo phiên đấu giá
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <TabButton
              active={activeTab === 'my-auctions'}
              onClick={() => handleTabChange('my-auctions')}
            >
              📦 Phiên của tôi
            </TabButton>
            <TabButton
              active={activeTab === 'my-bids'}
              onClick={() => handleTabChange('my-bids')}
            >
              🎯 Đang tham gia
            </TabButton>
            <TabButton
              active={activeTab === 'won'}
              onClick={() => handleTabChange('won')}
            >
              🏆 Đã thắng
            </TabButton>
          </div>

          {/* Content */}
          {loading && auctions.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg mb-4">{getEmptyMessage()}</p>
              {activeTab === 'my-auctions' && (
                <Button
                  onClick={() => navigate('/auction/create')}
                  className="bg-[#214d8c] hover:bg-[#1a3d6e]"
                >
                  Tạo phiên đấu giá đầu tiên
                </Button>
              )}
              {activeTab === 'my-bids' && (
                <Button
                  onClick={() => navigate('/auctions')}
                  variant="outline"
                >
                  Khám phá đấu giá
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? 'Đang tải...' : 'Xem thêm'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
      active
        ? 'bg-[#214d8c] text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100 border'
    }`}
  >
    {children}
  </button>
);

export default MyAuctionsPage;
