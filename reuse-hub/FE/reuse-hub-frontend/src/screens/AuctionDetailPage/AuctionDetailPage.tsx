import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { PlaceBidForm } from '../../components/Auction/PlaceBidForm';
import { BidHistory } from '../../components/Auction/BidHistory';
import { CountdownTimer } from '../../components/Auction/CountdownTimer';
import { AuctionResponse, BidResponse } from '../../types/auction';
import {
  getAuctionById,
  getAuctionBids,
  placeBid,
  buyNow,
  formatPrice,
  getAuctionStatusText,
  getAuctionStatusColor,
} from '../../api/auction';
import { useAuth } from '../../contexts/AuthContext';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';
import { ReportButton } from '../../components/Report/ReportButton';

export const AuctionDetailPage: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [bids, setBids] = useState<BidResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // WebSocket handlers
  const handleNewBid = useCallback((bid: BidResponse) => {
    setBids((prev) => [bid, ...prev]);
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentPrice: bid.amount,
        bidCount: prev.bidCount + 1,
        isUserHighestBidder: bid.bidderId === user?.id,
      };
    });
    toast.success(`Có lượt đấu giá mới: ${formatPrice(bid.amount)}`);
  }, [user?.id]);

  const handleOutbid = useCallback((message: string) => {
    toast.warning(message);
    setAuction((prev) => prev ? { ...prev, isUserHighestBidder: false } : prev);
  }, []);

  const handleAuctionEnded = useCallback(() => {
    toast.info('Phiên đấu giá đã kết thúc');
    fetchAuction();
  }, []);

  // Connect WebSocket
  const { isConnected } = useAuctionWebSocket({
    auctionId: auctionId || '',
    onNewBid: handleNewBid,
    onOutbid: handleOutbid,
    onAuctionEnded: handleAuctionEnded,
  });

  const fetchAuction = async () => {
    if (!auctionId) return;
    
    try {
      const response = await getAuctionById(auctionId, user?.id);
      if (response.status === 200 && response.data) {
        setAuction(response.data);
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Không thể tải thông tin đấu giá');
    }
  };

  const fetchBids = async () => {
    if (!auctionId) return;
    
    try {
      const response = await getAuctionBids(auctionId, 0, 50);
      if (response.status === 200 && response.data) {
        setBids(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAuction(), fetchBids()]);
      setLoading(false);
    };
    loadData();
  }, [auctionId, user?.id]);

  const handlePlaceBid = async (amount: number) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đấu giá');
      navigate('/login');
      return;
    }

    if (!auctionId) return;

    setBidLoading(true);
    try {
      const response = await placeBid(auctionId, user.id, { amount });
      if (response.status === 200) {
        toast.success('Đặt giá thành công!');
        await fetchAuction();
        await fetchBids();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setBidLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua');
      navigate('/login');
      return;
    }

    if (!auctionId) return;

    setBidLoading(true);
    try {
      const response = await buyNow(auctionId, user.id);
      if (response.status === 200) {
        toast.success('Mua ngay thành công!');
        await fetchAuction();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#214d8c]" />
        </div>
      </Layout>
    );
  }

  if (!auction) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy phiên đấu giá</h2>
            <Button onClick={() => navigate('/auctions')}>Quay lại danh sách</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === auction.sellerId;
  const canBid = auction.status === 'ACTIVE' && !isOwner;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* WebSocket Status */}
          <div className="mb-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Realtime đang hoạt động' : 'Đang kết nối...'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={auction.images?.[selectedImage] || '/placeholder-image.png'}
                    alt={auction.title}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full font-medium ${getAuctionStatusColor(auction.status)}`}>
                    {getAuctionStatusText(auction.status)}
                  </div>
                </div>

                {/* Thumbnails */}
                {auction.images && auction.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {auction.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                          selectedImage === idx ? 'border-[#214d8c]' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{auction.title}</h1>
                
                {auction.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-wrap">{auction.description}</p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Giá khởi điểm</p>
                    <p className="font-semibold">{formatPrice(auction.startingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bước giá</p>
                    <p className="font-semibold">{formatPrice(auction.bidIncrement)}</p>
                  </div>
                  {auction.reservePrice && (
                    <div>
                      <p className="text-sm text-gray-500">Giá sàn</p>
                      <p className="font-semibold">{formatPrice(auction.reservePrice)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Số lượt đấu giá</p>
                    <p className="font-semibold">{auction.bidCount}</p>
                  </div>
                </div>

                {/* Address */}
                {auction.address && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">📍 Địa chỉ</p>
                    <p className="text-gray-700">{auction.address}</p>
                  </div>
                )}
              </div>

              {/* Bid History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Lịch sử đấu giá</h2>
                <BidHistory bids={bids} currentUserId={user?.id} />
              </div>
            </div>

            {/* Right Column - Bidding */}
            <div className="space-y-6">
              {/* Countdown */}
              {auction.status === 'ACTIVE' && (
                <CountdownTimer
                  endTime={auction.endTime}
                  onEnd={() => fetchAuction()}
                />
              )}

              {/* Bid Form */}
              {canBid ? (
                <PlaceBidForm
                  auction={auction}
                  onPlaceBid={handlePlaceBid}
                  onBuyNow={auction.buyNowPrice ? handleBuyNow : undefined}
                  isLoading={bidLoading}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  {isOwner ? (
                    <p className="text-gray-600">Đây là phiên đấu giá của bạn</p>
                  ) : auction.status !== 'ACTIVE' ? (
                    <div>
                      <p className="text-gray-600 mb-2">Phiên đấu giá đã kết thúc</p>
                      {auction.winnerId && (
                        <p className="text-green-600 font-medium">
                          Giá cuối: {formatPrice(auction.currentPrice)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">Đăng nhập để tham gia đấu giá</p>
                      <Button onClick={() => navigate('/login')} className="bg-[#214d8c]">
                        Đăng nhập
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Người bán</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {auction.sellerAvatar ? (
                      <img src={auction.sellerAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-lg">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{auction.sellerName || 'Người bán'}</p>
                  </div>
                </div>
                {!isOwner && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(`/chat/${auction.sellerId}`)}
                    >
                      💬 Nhắn tin
                    </Button>
                    <ReportButton
                      entityType="AUCTION"
                      entityId={auction.id}
                      reportedUserId={auction.sellerId}
                      entityTitle={auction.title}
                      variant="full"
                      className="w-full mt-2"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionDetailPage;
