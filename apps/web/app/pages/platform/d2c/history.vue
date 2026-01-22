<script setup lang="ts">
definePageMeta({
  layout: 'platform',
  middleware: 'auth',
})
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        转换记录
      </h1>
      <p class="text-neutral-500 dark:text-neutral-400">
        查看设计稿转代码的历史记录
      </p>
    </div>

    <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-history" class="w-8 h-8 text-neutral-400" />
      </div>
      <h3 class="text-lg font-medium text-neutral-900 dark:text-white mb-2">
        暂无记录
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        转换设计稿后将在此显示历史记录
      </p>
    </div>
  </div>
</template>
