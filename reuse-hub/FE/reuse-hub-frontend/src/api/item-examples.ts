/**
 * EXAMPLES - Cách sử dụng Item APIs
 * 
 * File này chứa các ví dụ về cách sử dụng các API functions trong item.ts
 * Không import file này vào production code, chỉ dùng để tham khảo.
 */

import {
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  likeItem,
  unlikeItem,
  getAllItems,
  getMyItems,
  getPopularItems,
  getItemsByCategory,
  searchItems,
  formatPrice,
  formatCount,
} from './item';
import { ItemCreationRequest, ItemSearchRequest } from '../types/api';

// =================================================================
// EXAMPLE 1: Tạo item mới
// =================================================================
export const exampleCreateItem = async () => {
  const userId = 'user-123';
  
  const itemData: ItemCreationRequest = {
    title: 'iPhone 15 Pro Max 256GB',
    description: 'Điện thoại iPhone 15 Pro Max màu Titan tự nhiên, dung lượng 256GB, còn bảo hành Apple.',
    tags: ['iphone', 'apple', 'smartphone', 'pro-max'],
    category: 'Điện thoại',
    price: 25000000,
    locationRequest: {
      latitude: 10.8231,
      longitude: 106.6297
    }
  };

  // Tạo File objects từ input files (giả lập)
  const images: File[] = []; // Thay thế bằng actual File objects từ input

  try {
    const response = await createItem(userId, itemData, images);
    console.log('Item created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 2: Cập nhật item
// =================================================================
export const exampleUpdateItem = async () => {
  const userId = 'user-123';
  const itemId = 'item-456';
  
  const updateData = {
    title: 'iPhone 15 Pro Max 256GB - Giảm giá',
    price: 23000000, // Giảm giá
    description: 'Điện thoại iPhone 15 Pro Max màu Titan tự nhiên, dung lượng 256GB, còn bảo hành Apple. Giảm giá sốc!'
  };

  try {
    const response = await updateItem(userId, itemId, updateData);
    console.log('Item updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 3: Lấy danh sách items
// =================================================================
export const exampleGetAllItems = async () => {
  try {
    // Lấy trang đầu tiên với 20 items, sắp xếp theo ngày tạo mới nhất
    const response = await getAllItems(0, 20, 'createdAt', 'desc');
    console.log('All items:', response.data);
    
    // Hiển thị thông tin items
    response.data.content.forEach(item => {
      console.log(`- ${item.title}: ${formatPrice(item.price)}`);
      console.log(`  Likes: ${formatCount(item.likeCount)}, Views: ${formatCount(item.viewCount)}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting all items:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 4: Lấy items của user
// =================================================================
export const exampleGetMyItems = async () => {
  const userId = 'user-123';
  
  try {
    const response = await getMyItems(userId, 0, 10, 'createdAt', 'desc');
    console.log('My items:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting my items:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 5: Lấy items phổ biến
// =================================================================
export const exampleGetPopularItems = async () => {
  try {
    const response = await getPopularItems(0, 10, 'likeCount', 'desc');
    console.log('Popular items:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting popular items:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 6: Lấy items theo danh mục
// =================================================================
export const exampleGetItemsByCategory = async () => {
  const category = 'Điện thoại';
  
  try {
    const response = await getItemsByCategory(category, 0, 15, 'price', 'asc');
    console.log(`Items in category "${category}":`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting items by category:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 7: Tìm kiếm items
// =================================================================
export const exampleSearchItems = async () => {
  const searchRequest: ItemSearchRequest = {
    keyword: 'iphone'
  };
  
  try {
    const response = await searchItems(searchRequest, 0, 10, 'createdAt', 'desc');
    console.log('Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching items:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 8: Like/Unlike item
// =================================================================
export const exampleLikeItem = async () => {
  const userId = 'user-123';
  const itemId = 'item-456';
  
  try {
    // Like item
    await likeItem(userId, itemId);
    console.log('Item liked successfully');
    
    // Sau một lúc, unlike item
    setTimeout(async () => {
      await unlikeItem(userId, itemId);
      console.log('Item unliked successfully');
    }, 5000);
    
  } catch (error) {
    console.error('Error liking/unliking item:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 9: Lấy chi tiết item
// =================================================================
export const exampleGetItemById = async () => {
  const itemId = 'item-456';
  const currentUserId = 'user-123';
  
  try {
    const response = await getItemById(itemId, currentUserId);
    console.log('Item details:', response.data);
    
    const item = response.data;
    console.log(`Title: ${item.title}`);
    console.log(`Price: ${formatPrice(item.price)}`);
    console.log(`Status: ${item.status}`);
    console.log(`Images: ${item.images.length} images`);
    console.log(`Tags: ${item.tags.join(', ')}`);
    
    return response.data;
  } catch (error) {
    console.error('Error getting item by ID:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 10: Xóa item
// =================================================================
export const exampleDeleteItem = async () => {
  const userId = 'user-123';
  const itemId = 'item-456';
  
  try {
    await deleteItem(userId, itemId);
    console.log('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 11: Utility functions
// =================================================================
export const exampleUtilityFunctions = () => {
  // Format giá tiền
  const price = 25000000;
  console.log('Formatted price:', formatPrice(price)); // "25.000.000 ₫"
  
  // Format số lượng
  const likeCount = 1250;
  const viewCount = 1500000;
  console.log('Formatted likes:', formatCount(likeCount)); // "1.3K"
  console.log('Formatted views:', formatCount(viewCount)); // "1.5M"
};

// =================================================================
// EXAMPLE 12: Pagination handling
// =================================================================
export const examplePaginationHandling = async () => {
  try {
    let pageNo = 0;
    const pageSize = 10;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const response = await getAllItems(pageNo, pageSize);
      const page = response.data;
      
      console.log(`Page ${pageNo + 1}:`);
      page.content.forEach(item => {
        console.log(`- ${item.title}`);
      });
      
      // Kiểm tra có trang tiếp theo không
      hasMorePages = !page.last;
      pageNo++;
      
      // Giới hạn để tránh vòng lặp vô hạn
      if (pageNo > 5) break;
    }
    
  } catch (error) {
    console.error('Error in pagination example:', error);
    throw error;
  }
};

// =================================================================
// EXAMPLE 13: Error handling pattern
// =================================================================
export const exampleErrorHandling = async () => {
  try {
    const response = await getAllItems();
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    throw error;
  }
};
