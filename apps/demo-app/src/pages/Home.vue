<script setup lang="ts">
import type { OAuthConfig, UserInfo } from '@/types'
import { computed, onMounted, ref } from 'vue'

const CONFIG: OAuthConfig = {
  clientId: '9a71927e9242293768c5fe41fa8f07c4',
  clientSecret: '50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229',
  redirectUri: 'http://localhost:3002/callback',
  authorizeUrl: 'http://localhost:3000/oauth/authorize',
  tokenUrl: 'http://localhost:3001/oauth/token',
  userInfoUrl: 'http://localhost:3001/api/user/me',
}

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)
const error = ref<string | null>(null)
const activeTab = ref<'overview' | 'roles' | 'token'>('overview')
const showTooltip = ref(false)

const storage = {
  getItem: (key: string): string | null => globalThis.localStorage.getItem(key),
  setItem: (key: string, value: string): void => globalThis.localStorage.setItem(key, value),
  removeItem: (key: string): void => globalThis.localStorage.removeItem(key),
}

onMounted(() => {
  const token = storage.getItem('access_token')
  const storedUser = storage.getItem('user_info')
  if (token && storedUser) {
    try {
      isLoggedIn.value = true
      userInfo.value = JSON.parse(storedUser) as UserInfo
      fetchUserInfo()
    }
    catch {
      logout()
    }
  }
})

const isConfigured = computed(() => CONFIG.clientId !== 'your-client-id-here')

const userStatusClass = computed(() => {
  if (!userInfo.value)
    return ''
  switch (userInfo.value.status) {
    case 'ACTIVE': return 'status-active'
    case 'INACTIVE': return 'status-inactive'
    case 'SUSPENDED': return 'status-suspended'
    default: return ''
  }
})

const userStatusText = computed(() => {
  if (!userInfo.value)
    return ''
  switch (userInfo.value.status) {
    case 'ACTIVE': return '正常'
    case 'INACTIVE': return '未激活'
    case 'SUSPENDED': return '已停用'
    default: return userInfo.value.status
  }
})

function login(): void {
  if (!isConfigured.value) {
    error.value = '请先配置 Demo 应用信息'
    return
  }

  const state = generateRandomString(32)
  globalThis.sessionStorage.setItem('oauth_state', state)

  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    redirect_uri: CONFIG.redirectUri,
    response_type: 'code',
    state,
  })

  window.location.href = `${CONFIG.authorizeUrl}?${params.toString()}`
}

async function fetchUserInfo(): Promise<void> {
  const token = storage.getItem('access_token')
  if (!token)
    return

  try {
    const response = await fetch(CONFIG.userInfoUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const user = await response.json() as UserInfo
      userInfo.value = user
      storage.setItem('user_info', JSON.stringify(user))
      isLoggedIn.value = true
      error.value = null
    }
    else if (response.status === 401) {
      logout()
    }
  }
  catch (e) {
    console.error('Failed to fetch user info:', e)
  }
}

function logout(): void {
  storage.removeItem('access_token')
  storage.removeItem('refresh_token')
  storage.removeItem('user_info')
  isLoggedIn.value = false
  userInfo.value = null
  error.value = null
  activeTab.value = 'overview'
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  showTooltip.value = true
  setTimeout(() => showTooltip.value = false, 2000)
}
</script>

<template>
  <div class="page">
    <!-- Login Page -->
    <div v-if="!isLoggedIn" class="login-container">
      <!-- Left Side - Hero -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 class="hero-title">
              Zeta Demo
            </h1>
            <p class="hero-subtitle">
              安全、便捷的统一身份认证演示
            </p>
          </div>

          <div class="features">
            <div class="feature-item">
              <div class="feature-icon feature-icon-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div class="feature-text">
                <h3>安全可靠</h3>
                <p>采用 OAuth 2.0 标准，确保您的账号安全</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon feature-icon-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div class="feature-text">
                <h3>快速登录</h3>
                <p>一键授权登录，无需记忆额外密码</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon feature-icon-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <div class="feature-text">
                <h3>权限管理</h3>
                <p>完全掌控您授权的权限和数据</p>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-footer">
          <p>© 2024 Zeta Platform. All rights reserved.</p>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-container">
          <h2 class="form-title">
            登录到 Demo
          </h2>
          <p class="form-subtitle">
            使用您的 Zeta 账号继续
          </p>

          <!-- Config Warning -->
          <div v-if="!isConfigured" class="warning-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <h4>需要配置 Demo 应用</h4>
              <p>请在 Home.vue 中设置 clientId 和 clientSecret</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error && isConfigured" class="error-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Login Button -->
          <button
            :disabled="!isConfigured"
            class="login-btn"
            :class="{ 'login-btn-disabled': !isConfigured }"
            @click="login"
          >
            <svg class="zeta-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>使用 Zeta 账号登录</span>
          </button>

          <!-- OAuth Steps -->
          <div class="oauth-steps">
            <div class="step">
              <span class="step-num">1</span>
              <span class="step-text">点击登录</span>
              <span class="step-arrow">→</span>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <span class="step-text">Zeta 授权</span>
              <span class="step-arrow">→</span>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <span class="step-text">登录成功</span>
              <svg class="step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard (Logged In) -->
    <div v-else class="dashboard">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-small">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span class="sidebar-title">Zeta Demo</span>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="tab in ['overview', 'roles', 'token'] as const"
            :key="tab"
            class="nav-item"
            :class="{ 'nav-item-active': activeTab === tab }"
            @click="activeTab = tab"
          >
            <svg v-if="tab === 'overview'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <svg v-else-if="tab === 'roles'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>{{ tab === 'overview' ? '概览' : tab === 'roles' ? '角色权限' : '令牌' }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" @click="logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="user-info-mini">
            <div class="avatar-mini">
              <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo.name">
              <span v-else>{{ userInfo?.name?.charAt(0) }}</span>
            </div>
            <div class="user-text">
              <span class="user-name">{{ userInfo?.name }}</span>
              <span class="user-email">{{ userInfo?.email }}</span>
            </div>
          </div>
          <div class="status-badge" :class="userStatusClass">
            <span class="status-dot" />
            {{ userStatusText }}
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-content">
            <h2 class="content-title">
              账号概览
            </h2>

            <div class="stats-grid">
              <div class="stat-card stat-card-1">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-label">用户ID</span>
                  <span class="stat-value">{{ userInfo?.id?.slice(0, 8) }}...</span>
                </div>
              </div>

              <div class="stat-card stat-card-2">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-label">邮箱状态</span>
                  <span class="stat-value">{{ userInfo?.emailVerified ? '已验证' : '未验证' }}</span>
                </div>
              </div>

              <div class="stat-card stat-card-3">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-label">角色数量</span>
                  <span class="stat-value">{{ userInfo?.roles?.length || 0 }} 个</span>
                </div>
              </div>
            </div>

            <div class="details-card">
              <h3 class="details-title">
                详细信息
              </h3>
              <div class="details-list">
                <div class="detail-row">
                  <span class="detail-label">用户名</span>
                  <span class="detail-value">{{ userInfo?.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">邮箱地址</span>
                  <span class="detail-value">{{ userInfo?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">账号状态</span>
                  <div class="status-badge-small" :class="userStatusClass">
                    <span class="status-dot" />
                    {{ userStatusText }}
                  </div>
                </div>
                <div v-if="userInfo?.lastLoginAt" class="detail-row">
                  <span class="detail-label">最后登录</span>
                  <span class="detail-value">{{ new Date(userInfo.lastLoginAt).toLocaleString('zh-CN') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Tab -->
          <div v-else-if="activeTab === 'roles'" class="tab-content">
            <h2 class="content-title">
              角色与权限
            </h2>

            <div v-if="userInfo?.roles?.length" class="roles-list">
              <div v-for="role in userInfo.roles" :key="role.id" class="role-card">
                <div class="role-header">
                  <div class="role-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div class="role-info">
                    <h4 class="role-name">
                      {{ role.displayName }}
                    </h4>
                    <span class="role-code">{{ role.name }}</span>
                  </div>
                </div>
                <div v-if="role.permissions?.length" class="permissions-list">
                  <span v-for="perm in role.permissions" :key="perm.id" class="permission-tag">
                    {{ perm.displayName }}
                  </span>
                </div>
                <p v-else class="no-permissions">
                  无额外权限
                </p>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>暂无角色信息</p>
            </div>
          </div>

          <!-- Token Tab -->
          <div v-else-if="activeTab === 'token'" class="tab-content">
            <h2 class="content-title">
              访问令牌
            </h2>

            <div class="token-cards">
              <div class="token-card">
                <div class="token-header">
                  <div class="token-icon token-icon-access">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="token-title">
                      访问令牌 (Access Token)
                    </h4>
                    <p class="token-desc">
                      用于 API 调用的访问令牌
                    </p>
                  </div>
                  <button class="copy-btn" @click="copyToClipboard(storage.getItem('access_token') || '')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {{ showTooltip ? '已复制!' : '复制' }}
                  </button>
                </div>
                <div class="token-display">
                  <code>{{ storage.getItem('access_token') || 'N/A' }}</code>
                </div>
              </div>

              <div class="token-card">
                <div class="token-header">
                  <div class="token-icon token-icon-refresh">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="token-title">
                      刷新令牌 (Refresh Token)
                    </h4>
                    <p class="token-desc">
                      用于刷新访问令牌
                    </p>
                  </div>
                  <button class="copy-btn" @click="copyToClipboard(storage.getItem('refresh_token') || '')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    复制
                  </button>
                </div>
                <div class="token-display">
                  <code>{{ (storage.getItem('refresh_token') || '').slice(0, 60) }}...</code>
                </div>
              </div>
            </div>

            <div class="security-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <h4>安全提示</h4>
                <p>令牌存储在浏览器本地存储中。在生产环境中，建议使用 HttpOnly Cookie 存储刷新令牌以提高安全性。</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* ===== Login Page ===== */
.login-container {
  display: flex;
  min-height: 100vh;
}

.hero-section {
  flex: 1;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30px, 30px);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 60px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.features {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.feature-icon-1 {
  background: rgba(99, 102, 241, 0.3);
}

.feature-icon-2 {
  background: rgba(236, 72, 153, 0.3);
}

.feature-icon-3 {
  background: rgba(34, 197, 94, 0.3);
}

.feature-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.feature-text p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-footer {
  position: absolute;
  bottom: 40px;
  left: 60px;
  right: 60px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* Form Section */
.form-section {
  width: 500px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 15px;
  color: #666;
  margin-bottom: 32px;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  margin-bottom: 24px;
}

.warning-box svg {
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
}

.warning-box h4 {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
}

.warning-box p {
  font-size: 13px;
  color: #b45309;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  margin-bottom: 24px;
  color: #dc2626;
  font-size: 14px;
}

.error-box svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.login-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(100, 116, 139, 0.3);
}

.login-btn:hover:not(.login-btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(100, 116, 139, 0.4);
}

.login-btn:active:not(.login-btn-disabled) {
  transform: translateY(0);
}

.login-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zeta-logo {
  width: 24px;
  height: 24px;
}

.oauth-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.step-arrow {
  color: #d1d5db;
  font-size: 16px;
}

.step-check {
  width: 20px;
  height: 20px;
  color: #22c55e;
}

/* ===== Dashboard ===== */
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-small {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-small svg {
  width: 18px;
  height: 18px;
  color: white;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-item {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.nav-item svg {
  width: 20px;
  height: 20px;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-item-active {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
}

.nav-item-active:hover {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.logout-btn {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  background: white;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-mini {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-mini span {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  font-size: 13px;
  color: #64748b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-suspended {
  background: #fef2f2;
  color: #dc2626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.content-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-card-1 .stat-icon {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.stat-card-1 .stat-icon svg {
  color: white;
}

.stat-card-2 .stat-icon {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.stat-card-2 .stat-icon svg {
  color: white;
}

.stat-card-3 .stat-icon {
  background: linear-gradient(135deg, #34d399 0%, #22c55e 100%);
}

.stat-card-3 .stat-icon svg {
  color: white;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

/* Details Card */
.details-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.details-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.details-list {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.status-badge-small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Roles Tab */
.roles-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.role-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.role-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.role-code {
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
}

.no-permissions {
  font-size: 13px;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 16px;
  border: 1px dashed #e5e7eb;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin: 0 auto 16px;
}

.empty-state p {
  font-size: 15px;
  color: #9ca3af;
}

/* Token Tab */
.token-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.token-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.token-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.token-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-icon svg {
  width: 20px;
  height: 20px;
}

.token-icon-access {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.token-icon-access svg {
  color: white;
}

.token-icon-refresh {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.token-icon-refresh svg {
  color: white;
}

.token-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.token-desc {
  font-size: 13px;
  color: #64748b;
}

.copy-btn {
  margin-left: auto;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.copy-btn svg {
  width: 16px;
  height: 16px;
}

.token-display {
  background: #1a1a1a;
  border-radius: 10px;
  padding: 16px;
  overflow-x: auto;
}

.token-display code {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
  color: #4ade80;
  word-break: break-all;
}

.security-notice {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
}

.security-notice svg {
  width: 24px;
  height: 24px;
  color: #ca8a04;
  flex-shrink: 0;
}

.security-notice h4 {
  font-size: 15px;
  font-weight: 600;
  color: #854d0e;
  margin-bottom: 6px;
}

.security-notice p {
  font-size: 14px;
  color: #a16207;
  line-height: 1.6;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1a1a1a;
  }

  .form-title {
    color: #f5f5f5;
  }

  .form-subtitle {
    color: #a3a3a3;
  }

  .oauth-steps {
    background: #262626;
    border-color: #404040;
  }

  .step-text {
    color: #d4d4d4;
  }

  .dashboard {
    background: #0a0a0a;
  }

  .sidebar {
    background: #171717;
    border-color: #262626;
  }

  .sidebar-title {
    color: #f5f5f5;
  }

  .top-bar {
    background: #171717;
    border-color: #262626;
  }

  .user-name {
    color: #f5f5f5;
  }

  .content-title {
    color: #f5f5f5;
  }

  .stat-card,
  .details-card,
  .role-card,
  .token-card {
    background: #171717;
    border-color: #262626;
  }

  .stat-value,
  .detail-value,
  .role-name,
  .token-title {
    color: #f5f5f5;
  }

  .token-display {
    background: #0a0a0a;
  }

  .empty-state {
    background: #171717;
    border-color: #262626;
  }
}
</style>
