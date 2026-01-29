interface OAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
}

export function useOAuth() {
  const { get } = useApi()
  const route = useRoute()
  const githubLoading = ref(false)
  const dingtalkLoading = ref(false)

  /**
   * 构建回调地址，包含 URL 上的 redirect 参数
   */
  function buildCallbackUrl(basePath: string): string {
    const url = new URL(basePath, window.location.origin)
    // 从当前 URL 的 query 参数中获取 redirect（通常是登录页面携带的跳转目标）
    const redirect = route.query.redirect as string
    if (redirect) {
      url.searchParams.set('redirect', redirect)
    }
    return url.href
  }

  async function loginWithGitHub() {
    githubLoading.value = true
    try {
      // 构建包含 redirect 参数的回调地址
      const callbackUrl = buildCallbackUrl('/auth/callback/github')
      const oauthConfig = await get<OAuthConfig>(
        `/auth/github/config?redirectUri=${encodeURIComponent(callbackUrl)}`,
      )
      const state = crypto.randomUUID()
      const params = new URLSearchParams({
        client_id: oauthConfig.clientId,
        redirect_uri: oauthConfig.redirectUri,
        scope: oauthConfig.scope,
        state,
      })
      window.location.href = `${oauthConfig.authUrl}?${params.toString()}`
    }
    finally {
      githubLoading.value = false
    }
  }

  async function loginWithDingTalk() {
    dingtalkLoading.value = true
    try {
      // 构建包含 redirect 参数的回调地址
      const callbackUrl = buildCallbackUrl('/auth/callback/dingtalk')
      const oauthConfig = await get<OAuthConfig>(
        `/auth/dingtalk/config?redirectUri=${encodeURIComponent(callbackUrl)}`,
      )
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
    finally {
      dingtalkLoading.value = false
    }
  }

  return {
    loginWithGitHub,
    loginWithDingTalk,
    githubLoading,
    dingtalkLoading,
  }
}
