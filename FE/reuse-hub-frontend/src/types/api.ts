// =================================================================
// GENERIC API RESPONSE
// =================================================================
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// =================================================================
// AUTHENTICATION
// =================================================================

// -> POST /identity/auth/register
export interface UserCreationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE';
  username: string;
  password: string;
  address: Address[];
}

export interface Address {
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  country: string;
}

// <- POST /identity/auth/register (SUCCESS RESPONSE)
// Based on the JSON you provided
export interface UserCreationResponse {
  id: string; // This is the userId we need for the verification step
  phone: string;
  email: string;
  username: string;
  password?: string | null;
  userRoles?: any | null;
}

// -> POST /identity/auth/login
export interface SignInRequest {
  usernameOrEmail: string;
  password: string;
}

// <- POST /identity/auth/login (SUCCESS RESPONSE)
// Waiting for you to provide the JSON for this response
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// -> POST /identity/auth/confirm (as query params)
// userId: string
// verificationCode: string

// <- POST /identity/auth/confirm (SUCCESS RESPONSE)
// Waiting for you to provide the JSON for this response
export interface VerifyEmailResponse {
  id: string;
  status: 'ACTIVE' | 'PENDING';
  // ... other fields from the actual response
}

// =================================================================
// USER & ERROR MODELS
// =================================================================
export interface User {
  id: string;
  email: string;
  username: string;
  roles?: string[];
  status?: 'ACTIVE' | 'PENDING' | 'DISABLED'; // Added status property
  // ... other fields from the actual response
}

export interface ApiError {
  timestamp: string;
  status: number;
  path: string;
  error: string;
  message: string;
}
