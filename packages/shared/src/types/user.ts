// User types
export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  status: UserStatus
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  roles: Role[]
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// Role types
export interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  permissions: Permission[]
}

// Permission types
export interface Permission {
  id: string
  name: string
  displayName: string
  description: string | null
  module: string
}

// OAuth types
export enum OAuthProvider {
  GITHUB = 'GITHUB',
  DINGTALK = 'DINGTALK',
}

export interface OAuthAccount {
  id: string
  provider: OAuthProvider
  providerId: string
  userId: string
}
