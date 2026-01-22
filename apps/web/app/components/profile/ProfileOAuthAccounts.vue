<script setup lang="ts">
const config = useRuntimeConfig()
const { user, fetchUser } = useAuth()
const api = useApi()
const toast = useToast()

const unlinking = ref<string | null>(null)

const hasGitHub = computed(() =>
  user.value?.oauthAccounts?.some((a: any) => a.provider === 'GITHUB'),
)

const hasDingTalk = computed(() =>
  user.value?.oauthAccounts?.some((a: any) => a.provider === 'DINGTALK'),
)

const hasPassword = computed(() => !!user.value?.hasPassword)

const canUnlink = computed(() => {
  const oauthCount = user.value?.oauthAccounts?.length || 0
  return hasPassword.value || oauthCount > 1
})

function linkGitHub() {
  window.location.href = `${config.public.apiBase}/oauth/github`
}

function linkDingTalk() {
  window.location.href = `${config.public.apiBase}/oauth/dingtalk`
}

async function unlinkOAuth(provider: 'GITHUB' | 'DINGTALK') {
  if (!canUnlink.value) {
    toast.add({
      title: '无法解绑',
      description: '请先设置密码或关联其他登录方式',
      color: 'warning',
    })
    return
  }

  // eslint-disable-next-line no-alert
  if (!confirm(`确定要解绑 ${provider === 'GITHUB' ? 'GitHub' : '钉钉'} 账号吗？`)) {
    return
  }

  unlinking.value = provider
  try {
    await api.del(`/profile/oauth/${provider}`)
    await fetchUser()
    toast.add({ title: '解绑成功', color: 'success' })
  }
  catch (error: any) {
    toast.add({ title: '解绑失败', description: error.message, color: 'error' })
  }
  finally {
    unlinking.value = null
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        关联账号
      </h3>
    </template>

    <div class="space-y-3">
      <!-- GitHub -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-github" class="w-5 h-5" />
          <span>GitHub</span>
        </div>
        <div class="flex items-center gap-2">
          <UBadge v-if="hasGitHub" color="success" variant="subtle">
            已关联
          </UBadge>
          <UButton
            v-if="hasGitHub"
            size="xs"
            variant="outline"
            color="error"
            :loading="unlinking === 'GITHUB'"
            :disabled="!canUnlink"
            @click="unlinkOAuth('GITHUB')"
          >
            解绑
          </UButton>
          <UButton v-else size="xs" variant="outline" @click="linkGitHub">
            关联
          </UButton>
        </div>
      </div>

      <!-- DingTalk -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-dingtalk" class="w-5 h-5" />
          <span>钉钉</span>
        </div>
        <div class="flex items-center gap-2">
          <UBadge v-if="hasDingTalk" color="success" variant="subtle">
            已关联
          </UBadge>
          <UButton
            v-if="hasDingTalk"
            size="xs"
            variant="outline"
            color="error"
            :loading="unlinking === 'DINGTALK'"
            :disabled="!canUnlink"
            @click="unlinkOAuth('DINGTALK')"
          >
            解绑
          </UButton>
          <UButton v-else size="xs" variant="outline" @click="linkDingTalk">
            关联
          </UButton>
        </div>
      </div>

      <p v-if="!canUnlink" class="text-xs text-amber-600 dark:text-amber-400 mt-2">
        <UIcon name="i-lucide-alert-triangle" class="w-3 h-3 inline mr-1" />
        请先设置密码后才能解绑账号
      </p>
    </div>
  </UCard>
</template>
