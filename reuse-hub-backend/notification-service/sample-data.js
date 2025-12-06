// Notification Service Sample Data (MongoDB)
// Generated on 2024-12-04
// Run with: mongosh notification_db < sample-data.js

// Use the notification database
use('notification_db');

// Clear existing data (optional)
db.notifications.deleteMany({});

// User IDs from identity service
const users = {
  admin: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  nguyenvana: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  tranthib: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
  levanc: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
  phamthid: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
  hoangvane: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e'
};

// Item IDs from item service
const items = {
  iphone: '11111111-1111-4111-8111-111111111111',
  aoKhoac: '22222222-2222-4222-8222-222222222222',
  ban: '33333333-3333-4333-8333-333333333333',
  sach: '44444444-4444-4444-8444-444444444444',
  xeDap: '55555555-5555-4555-8555-555555555555'
};

// Transaction IDs from transaction service
const transactions = {
  t1: 't1111111-1111-4111-8111-111111111111',
  t2: 't2222222-2222-4222-8222-222222222222',
  t3: 't3333333-3333-4333-8333-333333333333',
  t4: 't4444444-4444-4444-8444-444444444444',
  t5: 't5555555-5555-4555-8555-555555555555'
};

// Current timestamp
const now = new Date();

// Insert Notifications
const notifications = [
  // Notifications for Nguyễn Văn A
  {
    _id: new ObjectId(),
    userId: users.nguyenvana,
    title: 'Sản phẩm của bạn đã được bán',
    message: 'iPhone 13 Pro Max 256GB của bạn đã được Trần Thị B mua. Giao dịch đã hoàn tất.',
    type: 'TRANSACTION_COMPLETED',
    relatedId: transactions.t1,
    isRead: true,
    metadata: {
      itemId: items.iphone,
      itemTitle: 'iPhone 13 Pro Max 256GB - Xanh Sierra',
      buyerId: users.tranthib,
      buyerName: 'Trần Thị B',
      amount: 18500000
    },
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    _id: new ObjectId(),
    userId: users.nguyenvana,
    title: 'Tin nhắn mới',
    message: 'Hoàng Văn E đã gửi tin nhắn cho bạn về Xe đạp thể thao Giant',
    type: 'NEW_MESSAGE',
    relatedId: items.xeDap,
    isRead: false,
    metadata: {
      senderId: users.hoangvane,
      senderName: 'Hoàng Văn E',
      itemId: items.xeDap
    },
    createdAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    _id: new ObjectId(),
    userId: users.nguyenvana,
    title: 'Giao dịch đang xử lý',
    message: 'Đơn hàng Xe đạp thể thao Giant đang được vận chuyển',
    type: 'TRANSACTION_IN_PROGRESS',
    relatedId: transactions.t5,
    isRead: false,
    metadata: {
      itemId: items.xeDap,
      transactionId: transactions.t5,
      sellerId: users.hoangvane,
      sellerName: 'Hoàng Văn E'
    },
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago
  },

  // Notifications for Trần Thị B
  {
    _id: new ObjectId(),
    userId: users.tranthib,
    title: 'Giao dịch thành công',
    message: 'Bạn đã mua thành công iPhone 13 Pro Max 256GB từ Nguyễn Văn A',
    type: 'TRANSACTION_COMPLETED',
    relatedId: transactions.t1,
    isRead: true,
    metadata: {
      itemId: items.iphone,
      itemTitle: 'iPhone 13 Pro Max 256GB - Xanh Sierra',
      sellerId: users.nguyenvana,
      sellerName: 'Nguyễn Văn A',
      amount: 18500000
    },
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    userId: users.tranthib,
    title: 'Tin nhắn mới',
    message: 'Lê Văn C đã gửi tin nhắn cho bạn về Áo khoác Denim',
    type: 'NEW_MESSAGE',
    relatedId: items.aoKhoac,
    isRead: false,
    metadata: {
      senderId: users.levanc,
      senderName: 'Lê Văn C',
      itemId: items.aoKhoac
    },
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    _id: new ObjectId(),
    userId: users.tranthib,
    title: 'Sản phẩm được quan tâm',
    message: 'Áo khoác Denim Unisex của bạn có 12 lượt thích mới',
    type: 'ITEM_LIKED',
    relatedId: items.aoKhoac,
    isRead: true,
    metadata: {
      itemId: items.aoKhoac,
      itemTitle: 'Áo khoác Denim Unisex - Size M',
      likeCount: 12
    },
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },

  // Notifications for Lê Văn C
  {
    _id: new ObjectId(),
    userId: users.levanc,
    title: 'Sản phẩm đã được bán',
    message: 'Bàn làm việc gỗ của bạn đã được Phạm Thị D mua. Giao dịch hoàn tất.',
    type: 'TRANSACTION_COMPLETED',
    relatedId: transactions.t3,
    isRead: true,
    metadata: {
      itemId: items.ban,
      itemTitle: 'Bàn làm việc gỗ công nghiệp 1m2 x 60cm',
      buyerId: users.phamthid,
      buyerName: 'Phạm Thị D',
      amount: 1200000
    },
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    _id: new ObjectId(),
    userId: users.levanc,
    title: 'Đơn hàng chờ xác nhận',
    message: 'Bạn có đơn hàng mới cho Áo khoác Denim Unisex',
    type: 'NEW_ORDER',
    relatedId: transactions.t2,
    isRead: false,
    metadata: {
      itemId: items.aoKhoac,
      transactionId: transactions.t2,
      buyerId: users.levanc,
      buyerName: 'Lê Văn C'
    },
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
  },

  // Notifications for Phạm Thị D
  {
    _id: new ObjectId(),
    userId: users.phamthid,
    title: 'Giao dịch thành công',
    message: 'Bạn đã mua thành công Bàn làm việc gỗ từ Lê Văn C',
    type: 'TRANSACTION_COMPLETED',
    relatedId: transactions.t3,
    isRead: true,
    metadata: {
      itemId: items.ban,
      itemTitle: 'Bàn làm việc gỗ công nghiệp 1m2 x 60cm',
      sellerId: users.levanc,
      sellerName: 'Lê Văn C',
      amount: 1200000
    },
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    userId: users.phamthid,
    title: 'Đánh giá sản phẩm',
    message: 'Hãy đánh giá Bàn làm việc gỗ bạn vừa mua',
    type: 'REVIEW_REQUEST',
    relatedId: transactions.t3,
    isRead: false,
    metadata: {
      itemId: items.ban,
      transactionId: transactions.t3,
      sellerId: users.levanc
    },
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    _id: new ObjectId(),
    userId: users.phamthid,
    title: 'Sản phẩm được quan tâm',
    message: 'Combo sách lập trình của bạn có 34 lượt thích',
    type: 'ITEM_LIKED',
    relatedId: items.sach,
    isRead: true,
    metadata: {
      itemId: items.sach,
      itemTitle: 'Combo 5 cuốn sách lập trình',
      likeCount: 34
    },
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },

  // Notifications for Hoàng Văn E
  {
    _id: new ObjectId(),
    userId: users.hoangvane,
    title: 'Giao dịch bị hủy',
    message: 'Đơn hàng Combo sách lập trình đã bị hủy',
    type: 'TRANSACTION_CANCELLED',
    relatedId: transactions.t4,
    isRead: true,
    metadata: {
      itemId: items.sach,
      transactionId: transactions.t4,
      sellerId: users.phamthid,
      reason: 'Người mua hủy do không còn nhu cầu'
    },
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    userId: users.hoangvane,
    title: 'Đơn hàng mới',
    message: 'Nguyễn Văn A muốn mua Xe đạp thể thao Giant của bạn',
    type: 'NEW_ORDER',
    relatedId: transactions.t5,
    isRead: false,
    metadata: {
      itemId: items.xeDap,
      transactionId: transactions.t5,
      buyerId: users.nguyenvana,
      buyerName: 'Nguyễn Văn A',
      amount: 3200000
    },
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    userId: users.hoangvane,
    title: 'Sản phẩm được xem nhiều',
    message: 'Xe đạp thể thao Giant của bạn đã có 178 lượt xem',
    type: 'ITEM_VIEW_MILESTONE',
    relatedId: items.xeDap,
    isRead: true,
    metadata: {
      itemId: items.xeDap,
      itemTitle: 'Xe đạp thể thao Giant ATX 26"',
      viewCount: 178
    },
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  },

  // System notifications for all users
  {
    _id: new ObjectId(),
    userId: users.nguyenvana,
    title: 'Chào mừng đến với ReuseHub',
    message: 'Cảm ơn bạn đã tham gia ReuseHub! Hãy bắt đầu mua bán đồ cũ ngay hôm nay.',
    type: 'SYSTEM_WELCOME',
    relatedId: null,
    isRead: true,
    metadata: {
      welcomeBonus: 0
    },
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    _id: new ObjectId(),
    userId: users.tranthib,
    title: 'Chào mừng đến với ReuseHub',
    message: 'Cảm ơn bạn đã tham gia ReuseHub! Hãy bắt đầu mua bán đồ cũ ngay hôm nay.',
    type: 'SYSTEM_WELCOME',
    relatedId: null,
    isRead: true,
    metadata: {
      welcomeBonus: 0
    },
    createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
];

db.notifications.insertMany(notifications);
print('✓ Inserted ' + notifications.length + ' notifications');

print('\n=== Notification Service Sample Data Loaded Successfully ===');
print('Total Notifications: ' + notifications.length);
print('Unread Notifications: ' + notifications.filter(n => !n.isRead).length);
print('Read Notifications: ' + notifications.filter(n => n.isRead).length);
