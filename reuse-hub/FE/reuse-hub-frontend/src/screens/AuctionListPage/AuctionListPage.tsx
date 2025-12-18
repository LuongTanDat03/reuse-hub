import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { AuctionCard } from '../../components/Auction/AuctionCard';
import { Button } from '../../components/ui/button';
import { AuctionResponse } from '../../types/auction';
import {
  getActiveAuctions,
  getAuctionsEndingSoon,
  getHotAuctions,
  searchAuctions,
} from '../../api/auction';

type TabType = 'all' | 'ending-soon' | 'hot';

export const AuctionListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchAuctions = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      let response;

      const keyword = searchParams.get('q');
      if (keyword) {
        response = await searchAuctions(keyword, currentPage, 12);
        setSearchKeyword(keyword);
      } else {
        switch (activeTab) {
          case 'ending-soon':
            response = await getAuctionsEndingSoon(currentPage, 12);
            break;
          case 'hot':
            response = await getHotAuctions(currentPage, 12);
            break;
          default:
            response = await getActiveAuctions(currentPage, 12);
        }
      }

      if (response.status === 200 && response.data) {
        const newAuctions = response.data.content;
        setAuctions(reset ? newAuctions : [...auctions, ...newAuctions]);
        setHasMore(!response.data.last);
        if (reset) setPage(0);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions(true);
  }, [activeTab, searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({});
    setSearchKeyword('');
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchAuctions();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ q: searchKeyword.trim() });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔨 Đấu giá</h1>
            <p className="text-gray-600">Tham gia đấu giá để sở hữu sản phẩm với giá tốt nhất</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm phiên đấu giá..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#214d8c]"
              />
              <Button type="submit" className="bg-[#214d8c] hover:bg-[#1a3d6e]">
                Tìm kiếm
              </Button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => handleTabChange('all')}
            >
              📋 Tất cả
            </TabButton>
            <TabButton
              active={activeTab === 'ending-soon'}
              onClick={() => handleTabChange('ending-soon')}
            >
              ⏰ Sắp kết thúc
            </TabButton>
            <TabButton
              active={activeTab === 'hot'}
              onClick={() => handleTabChange('hot')}
            >
              🔥 Đấu giá hot
            </TabButton>
          </div>

          {/* Search Result Info */}
          {searchParams.get('q') && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-gray-600">
                Kết quả tìm kiếm cho "{searchParams.get('q')}"
              </span>
              <button
                onClick={() => {
                  setSearchParams({});
                  setSearchKeyword('');
                }}
                className="text-[#214d8c] hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Auction Grid */}
          {loading && auctions.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Không có phiên đấu giá nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    className="px-8"
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

export default AuctionListPage;
