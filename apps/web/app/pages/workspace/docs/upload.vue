<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  middleware: 'auth',
})
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        上传管理
      </h1>
      <p class="text-neutral-500 dark:text-neutral-400">
        上传和管理文档资源
      </p>
    </div>

    <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-upload" class="w-8 h-8 text-neutral-400" />
      </div>
      <h3 class="text-lg font-medium text-neutral-900 dark:text-white mb-2">
        功能开发中
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        上传管理功能即将上线，敬请期待
      </p>
    </div>
  </div>
</template>
