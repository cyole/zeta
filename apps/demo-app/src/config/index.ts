import type { OAuthConfig } from '@/types'

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const CONFIG: OAuthConfig = {
  clientId: getEnvVar('VITE_OAUTH_CLIENT_ID', '9a71927e9242293768c5fe41fa8f07c4'),
  clientSecret: getEnvVar('VITE_OAUTH_CLIENT_SECRET', '50759abd32ce4b92aff4086cba90d6d4e9d0521d41b959397443ef8a02cda229'),
  redirectUri: getEnvVar('VITE_OAUTH_REDIRECT_URI', 'https://zeta-demo-app.vercel.app/callback'),
  authorizeUrl: getEnvVar('VITE_OAUTH_AUTHORIZE_URL', 'https://zeta.cyole.me/oauth2/authorize'),
  tokenUrl: getEnvVar('VITE_OAUTH_TOKEN_URL', 'https://zeta.cyole.me/api/oauth2/token'),
  userInfoUrl: getEnvVar('VITE_OAUTH_USER_INFO_URL', 'https://zeta.cyole.me/api/oauth2/me'),
}

export function isConfigured(): boolean {
  // 检查是否使用了占位符，而不是默认的demo凭证
  return (
    CONFIG.clientId !== 'your-client-id-here'
    && CONFIG.clientSecret !== 'your-client-secret-here'
  )
}
