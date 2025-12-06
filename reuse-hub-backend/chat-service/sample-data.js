// Chat Service Sample Data (MongoDB)
// Generated on 2024-12-04
// Run with: mongosh chat_db < sample-data.js

// Use the chat database
use('chat_db');

// Clear existing data (optional)
db.conversations.deleteMany({});
db.messages.deleteMany({});

// User IDs from identity service
const users = {
  admin: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  nguyenvana: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  tranthib: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
  levanc: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
  phamthid: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
  hoangvane: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e'
};

// Generate random ObjectId
function generateObjectId() {
  return new ObjectId();
}

// Current timestamp
const now = new Date();

// Insert Conversations
const conversations = [
  // Conversation 1: Nguyễn Văn A <-> Trần Thị B (về iPhone)
  {
    _id: generateObjectId(),
    participantIds: [users.nguyenvana, users.tranthib],
    lastMessageId: null, // Will be updated after inserting messages
    lastMessageTimestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'ACTIVE',
    pinnedMessages: [],
    mutedStatus: {},
    notificationSettings: {},
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    createdBy: users.tranthib,
    updatedBy: users.tranthib,
    isDeleted: false
  },
  
  // Conversation 2: Trần Thị B <-> Lê Văn C (về áo khoác)
  {
    _id: generateObjectId(),
    participantIds: [users.tranthib, users.levanc],
    lastMessageId: null,
    lastMessageTimestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    status: 'ACTIVE',
    pinnedMessages: [],
    mutedStatus: {},
    notificationSettings: {},
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    createdBy: users.levanc,
    updatedBy: users.levanc,
    isDeleted: false
  },
  
  // Conversation 3: Lê Văn C <-> Phạm Thị D (về bàn làm việc)
  {
    _id: generateObjectId(),
    participantIds: [users.levanc, users.phamthid],
    lastMessageId: null,
    lastMessageTimestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'ACTIVE',
    pinnedMessages: [],
    mutedStatus: {},
    notificationSettings: {},
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    createdBy: users.phamthid,
    updatedBy: users.phamthid,
    isDeleted: false
  },
  
  // Conversation 4: Phạm Thị D <-> Hoàng Văn E (về sách)
  {
    _id: generateObjectId(),
    participantIds: [users.phamthid, users.hoangvane],
    lastMessageId: null,
    lastMessageTimestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    status: 'ACTIVE',
    pinnedMessages: [],
    mutedStatus: {},
    notificationSettings: {},
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    createdBy: users.hoangvane,
    updatedBy: users.hoangvane,
    isDeleted: false
  },
  
  // Conversation 5: Hoàng Văn E <-> Nguyễn Văn A (về xe đạp)
  {
    _id: generateObjectId(),
    participantIds: [users.hoangvane, users.nguyenvana],
    lastMessageId: null,
    lastMessageTimestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    status: 'ACTIVE',
    pinnedMessages: [],
    mutedStatus: {},
    notificationSettings: {},
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
    createdBy: users.nguyenvana,
    updatedBy: users.nguyenvana,
    isDeleted: false
  }
];

db.conversations.insertMany(conversations);
print('✓ Inserted ' + conversations.length + ' conversations');

// Insert Messages for each conversation
const messages = [];

// Messages for Conversation 1 (Nguyễn Văn A <-> Trần Thị B)
const conv1Id = conversations[0]._id.toString();
messages.push(
  {
    _id: generateObjectId(),
    conversationId: conv1Id,
    senderId: users.tranthib,
    recipientId: users.nguyenvana,
    content: 'Chào bạn, mình quan tâm đến chiếc iPhone 13 Pro Max của bạn. Máy còn bảo hành không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    createdBy: users.tranthib,
    updatedBy: users.tranthib,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv1Id,
    senderId: users.nguyenvana,
    recipientId: users.tranthib,
    content: 'Chào bạn! Máy còn bảo hành 6 tháng nữa nhé. Pin 95%, máy đẹp lắm.',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
    createdBy: users.nguyenvana,
    updatedBy: users.nguyenvana,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv1Id,
    senderId: users.tranthib,
    recipientId: users.nguyenvana,
    content: 'Tuyệt vời! Mình có thể xem máy trực tiếp được không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    createdBy: users.tranthib,
    updatedBy: users.tranthib,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv1Id,
    senderId: users.nguyenvana,
    recipientId: users.tranthib,
    content: 'Được chứ! Bạn có thể qua Quận 1 gặp mình được không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    createdBy: users.nguyenvana,
    updatedBy: users.nguyenvana,
    isDeleted: false
  }
);

// Messages for Conversation 2 (Trần Thị B <-> Lê Văn C)
const conv2Id = conversations[1]._id.toString();
messages.push(
  {
    _id: generateObjectId(),
    conversationId: conv2Id,
    senderId: users.levanc,
    recipientId: users.tranthib,
    content: 'Hi, áo khoác denim của bạn còn không? Size M vừa mình.',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    createdBy: users.levanc,
    updatedBy: users.levanc,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv2Id,
    senderId: users.tranthib,
    recipientId: users.levanc,
    content: 'Còn nha! Áo mới lắm, mặc 2-3 lần thôi. Bạn muốn gặp mặt hay ship?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    createdBy: users.tranthib,
    updatedBy: users.tranthib,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv2Id,
    senderId: users.levanc,
    recipientId: users.tranthib,
    content: 'Mình gặp mặt luôn cho nhanh. Hẹn bạn tại quán cafe gần nhà bạn nhé!',
    media: [],
    status: 'DELIVERED',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    createdBy: users.levanc,
    updatedBy: users.levanc,
    isDeleted: false
  }
);

// Messages for Conversation 3 (Lê Văn C <-> Phạm Thị D)
const conv3Id = conversations[2]._id.toString();
messages.push(
  {
    _id: generateObjectId(),
    conversationId: conv3Id,
    senderId: users.phamthid,
    recipientId: users.levanc,
    content: 'Bàn làm việc của bạn còn không? Mình đang cần gấp.',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    createdBy: users.phamthid,
    updatedBy: users.phamthid,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv3Id,
    senderId: users.levanc,
    recipientId: users.phamthid,
    content: 'Còn nha! Bàn rất chắc chắn, mình bán vì chuyển nhà. Giá 1tr2 có được không?',
    media: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    status: 'READ',
    type: 'IMAGE',
    reactions: {},
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    createdBy: users.levanc,
    updatedBy: users.levanc,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv3Id,
    senderId: users.phamthid,
    recipientId: users.levanc,
    content: 'OK deal! Mình lấy luôn. Bạn ship được không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    createdBy: users.phamthid,
    updatedBy: users.phamthid,
    isDeleted: false
  }
);

// Messages for Conversation 4 (Phạm Thị D <-> Hoàng Văn E)
const conv4Id = conversations[3]._id.toString();
messages.push(
  {
    _id: generateObjectId(),
    conversationId: conv4Id,
    senderId: users.hoangvane,
    recipientId: users.phamthid,
    content: 'Combo sách lập trình của bạn có sách nào về Node.js không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    createdBy: users.hoangvane,
    updatedBy: users.hoangvane,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv4Id,
    senderId: users.phamthid,
    recipientId: users.hoangvane,
    content: 'Có nha! Có cuốn Node.js Design Patterns rất hay. Tất cả 5 cuốn 850k thôi.',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    createdBy: users.phamthid,
    updatedBy: users.phamthid,
    isDeleted: false
  }
);

// Messages for Conversation 5 (Hoàng Văn E <-> Nguyễn Văn A)
const conv5Id = conversations[4]._id.toString();
messages.push(
  {
    _id: generateObjectId(),
    conversationId: conv5Id,
    senderId: users.nguyenvana,
    recipientId: users.hoangvane,
    content: 'Xe đạp Giant của bạn còn không? Mình muốn mua để tập thể dục.',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    createdBy: users.nguyenvana,
    updatedBy: users.nguyenvana,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv5Id,
    senderId: users.hoangvane,
    recipientId: users.nguyenvana,
    content: 'Còn nha! Xe mình bảo dưỡng định kỳ, phanh đĩa rất tốt. 3tr2 có lấy không?',
    media: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'],
    status: 'READ',
    type: 'IMAGE',
    reactions: {},
    createdAt: new Date(now.getTime() - 11 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 11 * 60 * 60 * 1000),
    createdBy: users.hoangvane,
    updatedBy: users.hoangvane,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv5Id,
    senderId: users.nguyenvana,
    recipientId: users.hoangvane,
    content: 'OK! Mình lấy. Bạn ship được không?',
    media: [],
    status: 'READ',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    createdBy: users.nguyenvana,
    updatedBy: users.nguyenvana,
    isDeleted: false
  },
  {
    _id: generateObjectId(),
    conversationId: conv5Id,
    senderId: users.hoangvane,
    recipientId: users.nguyenvana,
    content: 'Được! Mình ship COD cho bạn. Khoảng 2 ngày là đến.',
    media: [],
    status: 'DELIVERED',
    type: 'TEXT',
    reactions: {},
    createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
    createdBy: users.hoangvane,
    updatedBy: users.hoangvane,
    isDeleted: false
  }
);

db.messages.insertMany(messages);
print('✓ Inserted ' + messages.length + ' messages');

print('\n=== Chat Service Sample Data Loaded Successfully ===');
print('Conversations: ' + conversations.length);
print('Messages: ' + messages.length);
