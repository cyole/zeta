interface OAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
}

export function useOAuth() {
  const { get } = useApi()

  async function loginWithGitHub() {
    const oauthConfig = await get<OAuthConfig>('/oauth/github/config')
    const state = crypto.randomUUID()
    const params = new URLSearchParams({
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      scope: oauthConfig.scope,
      state,
    })
    window.location.href = `${oauthConfig.authUrl}?${params.toString()}`
  }

  async function loginWithDingTalk() {
    const oauthConfig = await get<OAuthConfig>('/oauth/dingtalk/config')
    const state = crypto.randomUUID()
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      scope: oauthConfig.scope,
      state,
      prompt: 'consent',
    })
    window.location.href = `${oauthConfig.authUrl}?${params.toString()}`
  }

  return {
    loginWithGitHub,
    loginWithDingTalk,
  }
}
