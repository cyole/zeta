<script setup lang="ts">
definePageMeta({
  layout: 'platform',
  middleware: 'auth',
})
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          接口协作助手
        </h1>
        <p class="text-slate-500 dark:text-slate-400">
          接口文档解析、Mock 数据生成、参数校验代码自动生成
        </p>
      </div>
      <UButton>
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
        导入接口
      </UButton>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-4 gap-4 mb-8">
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-file-json" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">
          Swagger 导入
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          支持 OpenAPI 3.0
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-database" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">
          Mock 生成
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          智能生成测试数据
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-code" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">
          代码生成
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Axios 请求封装
        </p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">
          校验生成
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Zod/VeeValidate
        </p>
      </div>
    </div>

    <!-- API List -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-slate-900 dark:text-white">
            接口列表
          </h3>
          <UInput placeholder="搜索接口..." icon="i-lucide-search" size="sm" class="w-64" />
        </div>
      </div>
      <div class="p-8 text-center text-slate-400 dark:text-slate-500">
        <UIcon name="i-lucide-plug" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="mb-4">
          暂无接口数据
        </p>
        <UButton variant="outline">
          <UIcon name="i-lucide-upload" class="w-4 h-4 mr-2" />
          导入 Swagger 文档
        </UButton>
      </div>
    </div>
  </div>
</template>
