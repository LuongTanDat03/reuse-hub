import axios from 'axios';
import {
  ApiResponse,
  ApiError,
  UserCreationRequest,
  UserCreationResponse,
  SignInRequest,
  SignInResponse,
  VerifyEmailResponse,
} from '../types/api';
import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS } from '../types/constants';

class ApiService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Handles the registration API call.
   * It is specifically designed to handle the 201 (Created) success response
   * and the 409 (Conflict) error response.
   * @param userData The user data for registration.
   * @returns A promise that resolves with the user creation response.
   * @throws An error with a user-friendly message if registration fails.
   */
  async register(userData: UserCreationRequest): Promise<UserCreationResponse> {
    try {
      const response = await axios.post<ApiResponse<UserCreationResponse>>(
        `${this.baseURL}${API_ENDPOINTS.REGISTER}`,
        userData,
        {
          headers: this.getHeaders(),
          // This tells axios to not throw an error on any status code,
          // so we can handle it manually.
          validateStatus: () => true,
        }
      );
      console.log('API Service: Raw Response Status:', response.status);
      console.log('API Service: Raw Response Data:', JSON.stringify(response.data, null, 2));

      // Check for success (201 Created) or if response.data contains an error
      if (response.status === HTTP_STATUS.CREATED) {
        console.log('API Service: Registration success (201)', response.data.data);
        return response.data.data;
      }

      // Special handling for 200 OK responses that contain a status object in data
      if (response.status === HTTP_STATUS.OK && response.data && typeof response.data === 'object' && 'status' in response.data) {
        const apiResponse = response.data as ApiResponse<any>; // Treat as a generic ApiResponse

        if (apiResponse.status === HTTP_STATUS.CREATED) {
          console.log('API Service: Registration success (200 OK with 201 in data)', apiResponse.data);
          // Assuming apiResponse.data directly contains UserCreationResponse if successful
          return apiResponse.data as UserCreationResponse;
        } else if (apiResponse.status === HTTP_STATUS.CONFLICT) {
          console.error('API Service: Registration Conflict (200 OK with 409 in data)', apiResponse);
          throw new Error('Email, số điện thoại hoặc username đã tồn tại. Vui lòng thử lại.');
        } else {
          // If it's a 200 OK but contains other error statuses in data, handle as unexpected
          console.error('API Service: Unexpected 200 OK with Error in Data', apiResponse);
          throw new Error(apiResponse.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');
        }
      }

      // Handle specific known errors (e.g., direct 409 Conflict if Gateway didn't wrap)
      if (response.status === HTTP_STATUS.CONFLICT) {
        const apiError = response.data as unknown as ApiError;
        console.error('API Service: Registration Conflict (direct 409)', apiError);
        throw new Error('Email, số điện thoại hoặc username đã tồn tại. Vui lòng thử lại.');
      }

      // Handle other unexpected errors (e.g., non-2xx status code directly)
      const apiError = response.data as unknown as ApiError;
      console.error('API Service: Unexpected Registration Error', response.status, apiError);
      throw new Error(apiError.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');

    } catch (error) {
      // Handle network errors or other exceptions from axios
      console.error('Network or Axios Error in register:', error);
      if (error instanceof Error) {
        // Re-throw custom errors from our checks above
        throw error;
      }
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
    }
  }

  /**
   * Handles the email verification API call.
   * @param userId The ID of the user to verify.
   * @param verificationCode The verification code from the email.
   * @returns A promise that resolves with the verification response.
   */
  async verifyEmail(userId: string, verificationCode: string): Promise<VerifyEmailResponse> {
    try {
      const response = await axios.post<ApiResponse<VerifyEmailResponse>>(
        `${this.baseURL}${API_ENDPOINTS.VERIFY_EMAIL}?userId=${userId}&verificationCode=${verificationCode}`,
        {},
        {
          headers: this.getHeaders(),
          validateStatus: () => true,
        }
      );

      console.log('API Service: Verify Email Response Status:', response.status);
      console.log('API Service: Verify Email Response Data:', JSON.stringify(response.data, null, 2));

      // Check for success (200 OK)
      if (response.status === HTTP_STATUS.OK) {
        if (response.data.status === HTTP_STATUS.OK) {
          console.log('API Service: Email verification success', response.data.data);
          return response.data.data || { id: userId, status: 'ACTIVE' };
        } else {
          console.error('API Service: Email verification error in response', response.data);
          throw new Error(response.data.message || 'Xác minh email thất bại.');
        }
      }

      // Handle error responses
      const apiError = response.data as unknown as ApiError;
      console.error('API Service: Email verification error', response.status, apiError);
      
      if (response.status === HTTP_STATUS.FORBIDDEN) {
        throw new Error('Mã xác minh không đúng hoặc đã hết hạn.');
      } else if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error('Không tìm thấy người dùng.');
      } else {
        throw new Error(apiError.message || 'Xác minh email thất bại.');
      }

    } catch (error) {
      console.error('Network or Axios Error in verifyEmail:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
    }
  }

  /**
   * Handles the login API call.
   * @param credentials The user's login credentials.
   * @returns A promise that resolves with the sign-in response.
   */
  async login(credentials: SignInRequest): Promise<SignInResponse> {
    try {
      const response = await axios.post<ApiResponse<SignInResponse>>(
        `${this.baseURL}${API_ENDPOINTS.LOGIN}`,
        credentials,
        {
          headers: this.getHeaders(),
          validateStatus: () => true,
        }
      );

      console.log('API Service: Login Response Status:', response.status);
      console.log('API Service: Login Response Data:', JSON.stringify(response.data, null, 2));

      // Check for success (200 OK)
      if (response.status === HTTP_STATUS.OK) {
        if (response.data.status === HTTP_STATUS.OK) {
          console.log('API Service: Login success', response.data.data);
          return response.data.data;
        } else {
          console.error('API Service: Login error in response', response.data);
          throw new Error(response.data.message || 'Đăng nhập thất bại.');
        }
      }

      // Handle error responses
      const apiError = response.data as unknown as ApiError;
      console.error('API Service: Login error', response.status, apiError);
      
      if (response.status === HTTP_STATUS.FORBIDDEN) {
        if (apiError.message.includes('disabled')) {
          throw new Error('Tài khoản chưa được kích hoạt. Vui lòng xác minh email trước.');
        } else {
          throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
      } else if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error('Không tìm thấy người dùng.');
      } else {
        throw new Error(apiError.message || 'Đăng nhập thất bại.');
      }

    } catch (error) {
      console.error('Network or Axios Error in login:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
    }
  }
}

export const apiService = new ApiService();
