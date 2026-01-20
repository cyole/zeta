<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">上传管理</h1>
      <p class="text-slate-500 dark:text-slate-400">上传和管理文档资源</p>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-upload" class="w-8 h-8 text-slate-400" />
      </div>
      <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">功能开发中</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">上传管理功能即将上线，敬请期待</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'platform',
  middleware: 'auth',
});
</script>
