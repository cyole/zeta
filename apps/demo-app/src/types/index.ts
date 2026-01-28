// Zeta OAuth Demo App Type Definitions

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizeUrl: string
  tokenUrl: string
  userInfoUrl: string
}

export interface UserInfo {
  id: string
  email: string
  name: string
  avatar?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  emailVerified: boolean
  roles?: Role[]
  createdAt?: string
  lastLoginAt?: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  permissions?: Permission[]
}

export interface Permission {
  id: string
  name: string
  displayName: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  tokenType?: string
}

export interface CallbackQuery {
  code?: string
  state?: string
  error?: string
  error_description?: string
}
