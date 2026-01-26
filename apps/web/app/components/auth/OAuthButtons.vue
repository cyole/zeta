<script setup lang="ts">
const { loginWithGitHub, loginWithDingTalk, githubLoading, dingtalkLoading } = useOAuth()

const appConfig = useAppConfig()
const primaryColor = computed(() => appConfig.ui.colors.primary)
</script>

<template>
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
