import axios from 'axios';
import {
  ApiResponse,
  ItemCreationRequest,
  ItemResponse,
  ItemSummaryResponse,
  ItemUpdateRequest,
  ItemSearchRequest,
  Page,
  Category,
  CommentResponse,
} from '../types/api';
import { API_BASE_URL, API_ENDPOINTS } from '../types/constants';

const ITEM_API_BASE_URL = `${API_BASE_URL}${API_ENDPOINTS.ITEMS}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// =================================================================
// CRUD OPERATIONS
// =================================================================

/**
 * Tạo item mới với hình ảnh
 * @param userId ID của user tạo item
 * @param request Thông tin item
 * @param images Danh sách hình ảnh (optional)
 * @returns Promise<ApiResponse<ItemResponse>>
 */
export const createItem = async (
  userId: string,
  request: ItemCreationRequest,
  images?: File[]
): Promise<ApiResponse<ItemResponse>> => {
  const formData = new FormData();
  
  const requestBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
  formData.append('request', requestBlob);
  
  if (images) {
    images.forEach((image) => formData.append('images', image));
  }

  const response = await axios.post<ApiResponse<ItemResponse>>(
    `${ITEM_API_BASE_URL}/create/${userId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );
  return response.data;
};

/**
 * Cập nhật item với hình ảnh
 * @param userId ID của user sở hữu item
 * @param itemId ID của item cần cập nhật
 * @param request Thông tin cập nhật
 * @param images Danh sách hình ảnh mới (optional)
 * @returns Promise<ApiResponse<ItemResponse>>
 */
export const updateItem = async (
  userId: string,
  itemId: string,
  request: ItemUpdateRequest,
  images?: File[]
): Promise<ApiResponse<ItemResponse>> => {
  const formData = new FormData();
  
  // Append request as Blob with JSON content-type
  const requestBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
  formData.append('request', requestBlob);
  
  if (images) {
    images.forEach((image) => formData.append('images', image));
  }

  const response = await axios.put<ApiResponse<ItemResponse>>(
    `${ITEM_API_BASE_URL}/update/${userId}/${itemId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        // Don't set Content-Type - let axios set it with boundary
      },
    }
  );
  return response.data;
};

/**
 * Xóa item
 * @param userId ID của user sở hữu item
 * @param itemId ID của item cần xóa
 * @returns Promise<ApiResponse<void>>
 */
export const deleteItem = async (userId: string, itemId: string): Promise<ApiResponse<void>> => {
  const response = await axios.delete<ApiResponse<void>>(
    `${ITEM_API_BASE_URL}/delete/${userId}/${itemId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Lấy chi tiết item theo ID
 * @param itemId ID của item
 * @param currentUserId ID của user hiện tại
 * @returns Promise<ApiResponse<ItemResponse>>
 */
export const getItemById = async (itemId: string, currentUserId: string): Promise<ApiResponse<ItemResponse>> => {
  const response = await axios.get<ApiResponse<ItemResponse>>(
    `${ITEM_API_BASE_URL}/${itemId}/${currentUserId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// =================================================================
// INTERACTION OPERATIONS
// =================================================================

/**
 * Like item
 * @param userId ID của user
 * @param itemId ID của item
 * @returns Promise<ApiResponse<void>>
 */
export const likeItem = async (userId: string, itemId: string): Promise<ApiResponse<void>> => {
  const response = await axios.post<ApiResponse<void>>(
    `${ITEM_API_BASE_URL}/like/${userId}/${itemId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Unlike item
 * @param userId ID của user
 * @param itemId ID của item
 * @returns Promise<ApiResponse<void>>
 */
export const unlikeItem = async (userId: string, itemId: string): Promise<ApiResponse<void>> => {
  const response = await axios.post<ApiResponse<void>>(
    `${ITEM_API_BASE_URL}/unlike/${userId}/${itemId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// =================================================================
// LISTING OPERATIONS
// =================================================================

/**
 * Lấy tất cả items với phân trang
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getAllItems = async (
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemResponse>>>(
    `${ITEM_API_BASE_URL}/public/all`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

/**
 * Lấy items của user hiện tại
 * @param userId ID của user
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getMyItems = async (
  userId: string,
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/my-items/${userId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

/**
 * Lấy items phổ biến (được like nhiều nhất)
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'likeCount')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getPopularItems = async (
  pageNo = 0,
  pageSize = 10,
  sortBy = 'likeCount',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/public/popular`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

/**
 * Lấy items theo danh mục
 * @param category Tên danh mục
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getItemsByCategory = async (
  category: string,
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  if (category === "tat-ca-san-pham") {
    return getAllItems(pageNo, pageSize, sortBy, sortDirection);
  }
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/public/${category}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

/**
 * Tìm kiếm items theo từ khóa
 * @param searchRequest Request tìm kiếm
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const searchItems = async (
  searchRequest: ItemSearchRequest,
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/public/search`,
    {
      headers: getAuthHeaders(),
      params: { 
        keyword: searchRequest.keyword,
        pageNo, 
        pageSize, 
        sortBy, 
        sortDirection 
      },
    }
  );
  return response.data;
};

// =================================================================
// CATEGORY OPERATIONS
// =================================================================

/**
 * Lấy tất cả categories
 * @returns Promise<ApiResponse<Category[]>>
 */
export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await axios.get<ApiResponse<Category[]>>(
    `${ITEM_API_BASE_URL}/public/categories`
  );
  return response.data;
};

// =================================================================
// COMMENT OPERATIONS
// =================================================================

/**
 * Lấy comments của một item
 * @param itemId ID của item
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<CommentResponse>>>
 */
export const getItemComments = async (
  itemId: string,
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<CommentResponse>>> => {
  const response = await axios.get<ApiResponse<Page<CommentResponse>>>(
    `${ITEM_API_BASE_URL}/public/comments/${itemId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

// =================================================================
// TAG OPERATIONS
// =================================================================

/**
 * Lấy items theo tags
 * @param tags Danh sách tags để tìm kiếm
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getItemsByTags = async (
  tags: string[],
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/public/tags`,
    {
      headers: getAuthHeaders(),
      params: {
        tags: tags,
        pageNo,
        pageSize,
        sortBy,
        sortDirection,
      },
    }
  );
  return response.data;
};

// =================================================================
// LOCATION OPERATIONS
// =================================================================

/**
 * Lấy items gần vị trí
 * @param latitude Vĩ độ
 * @param longitude Kinh độ
 * @param radius Bán kính tìm kiếm (mét, default: 5000)
 * @param pageNo Số trang (default: 0)
 * @param pageSize Kích thước trang (default: 10)
 * @param sortBy Trường sắp xếp (default: 'createdAt')
 * @param sortDirection Hướng sắp xếp (default: 'desc')
 * @returns Promise<ApiResponse<Page<ItemSummaryResponse>>>
 */
export const getNearbyItems = async (
  latitude: number,
  longitude: number,
  radius = 5000,
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<Page<ItemSummaryResponse>>> => {
  const response = await axios.get<ApiResponse<Page<ItemSummaryResponse>>>(
    `${ITEM_API_BASE_URL}/public/nearby`,
    {
      headers: getAuthHeaders(),
      params: {
        latitude,
        longitude,
        radius,
        pageNo,
        pageSize,
        sortBy,
        sortDirection,
      },
    }
  );
  return response.data;
};

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Kiểm tra xem user đã like item chưa
 * @param userId ID của user
 * @param itemId ID của item
 * @returns Promise<boolean>
 */
export const isItemLiked = async (userId: string, itemId: string): Promise<boolean> => {
  try {
    // Có thể implement API riêng để check like status
    // Hoặc sử dụng thông tin từ getItemById
    await getItemById(itemId, userId);
    // Logic để check like status từ response
    // TODO: Implement proper like status checking
    return false; // Placeholder
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

/**
 * Format giá tiền thành chuỗi hiển thị
 * @param price Giá tiền (number)
 * @returns Chuỗi giá tiền đã format
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Format số lượng thành chuỗi hiển thị
 * @param count Số lượng
 * @returns Chuỗi số lượng đã format
 */
export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
