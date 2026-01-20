// Auth response types
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: import('./user').User
}

export interface RegisterResponse {
  message: string
  user: import('./user').User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

// Auth request types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RefreshRequest {
  refreshToken: string
}
