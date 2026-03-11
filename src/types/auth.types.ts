export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface SignupRequest {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  message: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
}

