<script setup lang="ts">
import type { OAuthConfig, TokenResponse } from '@/types'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const CONFIG: OAuthConfig = {
  clientId: '9a71927e9242293768c5fe41fa8f07c4',
  clientSecret: '50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229',
  redirectUri: 'http://localhost:3002/callback',
  authorizeUrl: 'http://localhost:3000/oauth/authorize',
  tokenUrl: 'http://localhost:3001/api/oauth/token',
  userInfoUrl: 'http://localhost:3001/api/oauth/me',
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const error = urlParams.get('error')

  const savedState = globalThis.sessionStorage.getItem('oauth_state')
  if (state !== savedState) {
    console.error('State mismatch')
    router.push({ path: '/', query: { error: 'state_mismatch' } })
    return
  }

  if (error) {
    console.error('OAuth error:', error)
    router.push({ path: '/', query: { error } })
    return
  }

  if (code) {
    exchangeToken(code)
  }
  else {
    router.push({ path: '/', query: { error: 'no_code' } })
  }
})

async function exchangeToken(code: string): Promise<void> {
  try {
    const response = await fetch(CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        clientId: CONFIG.clientId,
        clientSecret: CONFIG.clientSecret,
        redirectUri: CONFIG.redirectUri,
        grantType: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json() as { message?: string }
      throw new Error(errorData.message || 'Token exchange failed')
    }

    const data = await response.json() as TokenResponse

    globalThis.localStorage.setItem('access_token', data.accessToken)
    if (data.refreshToken) {
      globalThis.localStorage.setItem('refresh_token', data.refreshToken)
    }

    // Fetch user info immediately after token exchange
    await fetchUserInfo()

    globalThis.sessionStorage.removeItem('oauth_state')
    router.push('/')
  }
  catch (err) {
    console.error('Token exchange error:', err)
    router.push({ path: '/', query: { error: 'token_exchange_failed' } })
  }
}

async function fetchUserInfo(): Promise<void> {
  const token = globalThis.localStorage.getItem('access_token')
  if (!token)
    return

  try {
    const response = await fetch(CONFIG.userInfoUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const user = await response.json()
      globalThis.localStorage.setItem('user_info', JSON.stringify(user))
    }
  }
  catch (e) {
    console.error('Failed to fetch user info:', e)
  }
}
</script>

<template>
  <div class="callback-page">
    <div class="callback-container">
      <div class="loading-spinner">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
      <h2 class="callback-title">
        正在处理登录
      </h2>
      <p class="callback-desc">
        正在验证您的授权信息，请稍候...
      </p>
      <div class="callback-steps">
        <div class="callback-step callback-step-done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>授权成功</span>
        </div>
        <div class="callback-step callback-step-active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>获取令牌</span>
        </div>
        <div class="callback-step">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>完成登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.callback-container {
  text-align: center;
  padding: 48px;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  color: white;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.callback-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.callback-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.callback-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.callback-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0.4;
}

.callback-step svg {
  width: 32px;
  height: 32px;
  color: white;
}

.callback-step span {
  font-size: 13px;
  color: white;
  font-weight: 500;
}

.callback-step-done {
  opacity: 1;
}

.callback-step-done svg {
  color: #4ade80;
}

.callback-step-active {
  opacity: 1;
}

.callback-step-active svg {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>
