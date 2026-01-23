<script setup lang="ts">
const { loginWithGitHub, loginWithDingTalk } = useOAuth()
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

  <div class="grid grid-cols-2 gap-3">
    <UButton
      color="neutral"
      variant="outline"
      size="lg"
      class="hover:bg-neutral-100 dark:hover:bg-neutral-900"
      @click="loginWithGitHub"
    >
      <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
      GitHub
    </UButton>
    <UButton
      color="neutral"
      variant="outline"
      size="lg"
      class="hover:bg-neutral-100 dark:hover:bg-neutral-900"
      @click="loginWithDingTalk"
    >
      <UIcon name="i-ant-design:dingtalk-circle-filled" class="w-5 h-5 mr-2" />
      钉钉
    </UButton>
  </div>
</template>
