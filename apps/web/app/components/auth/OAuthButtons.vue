<script setup lang="ts">
const { loginWithGitHub, loginWithDingTalk, githubLoading, dingtalkLoading } = useOAuth()

const appConfig = useAppConfig()
const primaryColor = computed(() => appConfig.ui.colors.primary)
</script>

<template>
  <div class="relative my-8">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-neutral-200 dark:border-neutral-800" />
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-400">或使用以下方式</span>
    </div>
  </div>

  <div class="flex gap-3">
    <UButton
      color="neutral"
      variant="outline"
      size="lg"
      class="flex-1"
      icon="i-simple-icons-github"
      :loading="githubLoading"
      :loading-color="primaryColor"
      @click="loginWithGitHub"
    >
      GitHub
    </UButton>

    <UButton
      color="neutral"
      variant="outline"
      size="lg"
      class="flex-1"
      :loading="dingtalkLoading"
      :loading-color="primaryColor"
      icon="i-ant-design:dingtalk-circle-filled"
      @click="loginWithDingTalk"
    >
      钉钉
    </UButton>
  </div>
</template>
