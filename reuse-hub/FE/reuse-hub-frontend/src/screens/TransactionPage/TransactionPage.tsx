import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MessageCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import { Header } from "../Desktop/sections/Header/Header";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  getMyTransactions,
  getBuyerTransactions,
  getSellerTransactions,
  confirmDelivery,
  completeTransaction,
  cancelTransaction,
  submitFeedback,
} from "../../api/transaction";
import { TransactionResponse, TransactionStatus } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { formatPrice } from "../../api/item";

export const TransactionPage = (): JSX.Element => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"all" | "buying" | "selling">("all");
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [selectedTxForFeedback, setSelectedTxForFeedback] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadTransactions();
  }, [activeTab, user]);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let response;
      if (activeTab === "buying") {
        response = await getBuyerTransactions(user.id, 0, 50);
      } else if (activeTab === "selling") {
        response = await getSellerTransactions(user.id, 0, 50);
      } else {
        response = await getMyTransactions(user.id, 0, 50);
      }
      setTransactions(response.data.content);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (txId: string) => {
    if (!user || !trackingCode.trim()) {
      toast.error("Vui lòng nhập mã vận đơn");
      return;
    }

    setActionLoading(txId);
    try {
      await confirmDelivery(user.id, txId, trackingCode);
      toast.success("Đã xác nhận giao hàng");
      loadTransactions();
      setTrackingCode("");
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Không thể xác nhận giao hàng");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTransaction = async (txId: string) => {
    if (!user) return;

    setActionLoading(txId);
    try {
      await completeTransaction(user.id, txId);
      toast.success("Đã hoàn thành giao dịch");
      loadTransactions();
    } catch (error) {
      console.error("Error completing transaction:", error);
      toast.error("Không thể hoàn thành giao dịch");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTransaction = async (txId: string, reason: string) => {
    if (!user) return;

    setActionLoading(txId);
    try {
      await cancelTransaction(user.id, txId, reason);
      toast.success("Đã hủy giao dịch");
      loadTransactions();
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      toast.error("Không thể hủy giao dịch");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitFeedback = async (txId: string) => {
    if (!user) return;

    setActionLoading(txId);
    try {
      await submitFeedback(user.id, txId, { rating, comment });
      toast.success("Đã gửi đánh giá");
      setSelectedTxForFeedback(null);
      setRating(5);
      setComment("");
      loadTransactions();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Không thể gửi đánh giá");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusInfo = (status: TransactionStatus) => {
    const statusMap = {
      PENDING: { label: "Chờ xác nhận", color: "bg-yellow-50 text-yellow-700", icon: Clock },
      PAYMENT_PENDING: { label: "Chờ thanh toán", color: "bg-orange-50 text-orange-700", icon: AlertCircle },
      CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-50 text-blue-700", icon: CheckCircle },
      SHIPPED: { label: "Đang giao hàng", color: "bg-purple-50 text-purple-700", icon: Truck },
      IN_DELIVERY: { label: "Đang giao", color: "bg-purple-50 text-purple-700", icon: Truck },
      DELIVERY: { label: "Đã giao", color: "bg-green-50 text-green-700", icon: CheckCircle },
      COMPLETED: { label: "Hoàn thành", color: "bg-green-50 text-green-700", icon: CheckCircle },
      PAYMENT_COMPLETED: { label: "Đã thanh toán", color: "bg-green-50 text-green-700", icon: CheckCircle },
      CANCELLED: { label: "Đã hủy", color: "bg-red-50 text-red-700", icon: XCircle },
      REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-50 text-gray-700", icon: XCircle },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const canSellerConfirmDelivery = (tx: TransactionResponse) => {
    return user?.id === tx.sellerId && (tx.status === "CONFIRMED" || tx.status === "PENDING");
  };

  const canBuyerComplete = (tx: TransactionResponse) => {
    return user?.id === tx.buyerId && (tx.status === "DELIVERY" || tx.status === "SHIPPED");
  };

  const canCancel = (tx: TransactionResponse) => {
    return tx.status === "PENDING" || tx.status === "CONFIRMED";
  };

  const canSubmitFeedback = (tx: TransactionResponse) => {
    return user?.id === tx.buyerId && tx.status === "COMPLETED" && !tx.feedbackSubmitted;
  };

  const canPayment = (tx: TransactionResponse) => {
    return user?.id === tx.buyerId && (tx.status === "PAYMENT_PENDING" || tx.status === "PENDING");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h2>
          <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý giao dịch</h1>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="buying">Đang mua</TabsTrigger>
            <TabsTrigger value="selling">Đang bán</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có giao dịch nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bắt đầu mua hoặc bán sản phẩm để xem giao dịch tại đây
                  </p>
                  <Button onClick={() => navigate("/")}>Khám phá sản phẩm</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => {
                  const statusInfo = getStatusInfo(tx.status);
                  const StatusIcon = statusInfo.icon;
                  const isBuyer = user.id === tx.buyerId;

                  return (
                    <Card key={tx.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                              <div className="flex items-center gap-1">
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {isBuyer ? "Bạn đang mua" : "Bạn đang bán"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Mã GD: {tx.id.slice(0, 8)}...
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {tx.itemImageUrl ? (
                              <img
                                src={tx.itemImageUrl}
                                alt={tx.itemTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Transaction Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {tx.itemTitle || "Sản phẩm"}
                            </h3>
                            <div className="text-sm text-gray-600 mb-2">
                              Số lượng: {tx.quantity || 1} • Tổng tiền:{" "}
                              <span className="font-semibold text-blue-600">
                                {formatPrice(tx.totalAmount || tx.totalPrice || 0)}
                              </span>
                            </div>

                            {tx.deliveryAddress && (
                              <div className="text-sm text-gray-600 mb-2">
                                Địa chỉ: {tx.deliveryAddress}
                              </div>
                            )}

                            {tx.deliveryTrackingCode && (
                              <div className="text-sm text-gray-600 mb-2">
                                Mã vận đơn: <span className="font-mono">{tx.deliveryTrackingCode}</span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {/* Buyer: Payment Button */}
                              {canPayment(tx) && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => navigate(`/payment?transactionId=${tx.id}&itemId=${tx.itemId}&amount=${tx.totalAmount || tx.totalPrice || 0}`)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Thanh toán ngay
                                </Button>
                              )}

                              {/* Seller: Confirm Delivery */}
                              {canSellerConfirmDelivery(tx) && (
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Nhập mã vận đơn"
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    className="w-48"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmDelivery(tx.id)}
                                    disabled={actionLoading === tx.id}
                                  >
                                    <Truck className="w-4 h-4 mr-1" />
                                    Xác nhận giao hàng
                                  </Button>
                                </div>
                              )}

                              {/* Buyer: Complete Transaction */}
                              {canBuyerComplete(tx) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteTransaction(tx.id)}
                                  disabled={actionLoading === tx.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Đã nhận hàng
                                </Button>
                              )}

                              {/* Cancel */}
                              {canCancel(tx) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelTransaction(tx.id, "Người dùng hủy")}
                                  disabled={actionLoading === tx.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Hủy giao dịch
                                </Button>
                              )}

                              {/* Submit Feedback */}
                              {canSubmitFeedback(tx) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTxForFeedback(tx.id)}
                                >
                                  <Star className="w-4 h-4 mr-1" />
                                  Đánh giá
                                </Button>
                              )}

                              {/* Chat */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/chat/${isBuyer ? tx.sellerId : tx.buyerId}`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Chat
                              </Button>

                              {/* View Item */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/product/${tx.itemId}`)}
                              >
                                Xem sản phẩm
                              </Button>
                            </div>

                            {/* Feedback Form */}
                            {selectedTxForFeedback === tx.id && (
                              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-3">Đánh giá giao dịch</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm text-gray-700 mb-1 block">
                                      Đánh giá (1-5 sao)
                                    </label>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          onClick={() => setRating(star)}
                                          className="focus:outline-none"
                                        >
                                          <Star
                                            className={`w-6 h-6 ${
                                              star <= rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-700 mb-1 block">
                                      Nhận xét
                                    </label>
                                    <Input
                                      placeholder="Chia sẻ trải nghiệm của bạn..."
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSubmitFeedback(tx.id)}
                                      disabled={actionLoading === tx.id}
                                    >
                                      Gửi đánh giá
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedTxForFeedback(null)}
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
