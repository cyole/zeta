interface OAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  authUrl: string
}

export function useOAuth() {
  const { get } = useApi()
  const githubLoading = ref(false)
  const dingtalkLoading = ref(false)

  async function loginWithGitHub() {
    githubLoading.value = true
    try {
      const oauthConfig = await get<OAuthConfig>('/auth/github/config')
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
      const oauthConfig = await get<OAuthConfig>('/dingtalk/config')
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
