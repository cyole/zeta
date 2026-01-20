<template>
  <NuxtLayout name="platform">
    <template #sidebar>
      <div class="space-y-1">
        <NuxtLink
          v-for="item in sidebarItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            isActive(item.to)
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <UIcon :name="item.icon" class="w-4 h-4" />
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </template>

    <div class="p-6">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">设计转代码 (D2C)</h1>
        <p class="text-slate-500 dark:text-slate-400">智能识别设计组件、布局逻辑，精准生成框架代码</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid md:grid-cols-3 gap-4 mb-8">
        <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UIcon name="i-lucide-upload" class="w-5 h-5 text-white" />
          </div>
          <h3 class="font-medium text-slate-900 dark:text-white mb-1">上传设计稿</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">支持 Figma、Sketch 文件</p>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UIcon name="i-lucide-link" class="w-5 h-5 text-white" />
          </div>
          <h3 class="font-medium text-slate-900 dark:text-white mb-1">Figma 链接</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">粘贴 Figma 分享链接</p>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all group">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UIcon name="i-lucide-history" class="w-5 h-5 text-white" />
          </div>
          <h3 class="font-medium text-slate-900 dark:text-white mb-1">历史记录</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">查看转换历史</p>
        </div>
      </div>

      <!-- Main Upload Area -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <UIcon name="i-lucide-image-plus" class="w-8 h-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">拖拽设计稿到这里</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">或点击上传，支持 .fig、.sketch、.png、.jpg 格式</p>
        <UButton>
          <UIcon name="i-lucide-upload" class="w-4 h-4 mr-2" />
          选择文件
        </UButton>
      </div>

      <!-- Recent Conversions -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">最近转换</h2>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="p-8 text-center text-slate-400 dark:text-slate-500">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无转换记录</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
});

const route = useRoute();
const sidebarCollapsed = inject('sidebarCollapsed', ref(false));

const sidebarItems = [
  { label: '设计稿转换', icon: 'i-lucide-wand-2', to: '/platform/d2c' },
  { label: '组件识别', icon: 'i-lucide-scan', to: '/platform/d2c/components' },
  { label: '转换记录', icon: 'i-lucide-history', to: '/platform/d2c/history' },
  { label: '设置', icon: 'i-lucide-settings', to: '/platform/d2c/settings' },
];

const isActive = (path: string) => route.path === path;
</script>
