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
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">文档智能管理</h1>
          <p class="text-slate-500 dark:text-slate-400">自然语言检索、多轮问答、文档自动更新</p>
        </div>
        <UButton>
          <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
          导入文档
        </UButton>
      </div>

      <!-- Search -->
      <div class="mb-8">
        <div class="relative">
          <UInput
            v-model="searchQuery"
            placeholder="输入问题搜索文档，如：Table 组件如何实现树形结构？"
            icon="i-lucide-search"
            size="xl"
            class="w-full"
          />
          <UButton class="absolute right-2 top-1/2 -translate-y-1/2" size="sm">
            AI 问答
          </UButton>
        </div>
      </div>

      <!-- Document Categories -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div
          v-for="category in categories"
          :key="category.name"
          class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-colors"
        >
          <div class="flex items-center gap-3 mb-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', category.bgClass]">
              <UIcon :name="category.icon" class="w-4 h-4 text-white" />
            </div>
            <span class="font-medium text-slate-900 dark:text-white">{{ category.name }}</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ category.count }} 篇文档</p>
        </div>
      </div>

      <!-- Recent Documents -->
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">最近浏览</h2>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div
            v-for="(doc, index) in recentDocs"
            :key="doc.id"
            :class="[
              'flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
              index !== recentDocs.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
            ]"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-slate-400" />
              <div>
                <h4 class="font-medium text-slate-900 dark:text-white">{{ doc.title }}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ doc.category }}</p>
              </div>
            </div>
            <span class="text-xs text-slate-400">{{ doc.time }}</span>
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
const searchQuery = ref('');

const sidebarItems = [
  { label: '文档检索', icon: 'i-lucide-search', to: '/platform/docs' },
  { label: '组件文档', icon: 'i-lucide-component', to: '/platform/docs/components' },
  { label: '接口文档', icon: 'i-lucide-plug', to: '/platform/docs/api' },
  { label: '上传管理', icon: 'i-lucide-upload', to: '/platform/docs/upload' },
];

const categories = [
  { name: '组件库', icon: 'i-lucide-component', count: 56, bgClass: 'bg-blue-500' },
  { name: '接口文档', icon: 'i-lucide-plug', count: 128, bgClass: 'bg-green-500' },
  { name: '开发规范', icon: 'i-lucide-book', count: 24, bgClass: 'bg-purple-500' },
  { name: '业务文档', icon: 'i-lucide-briefcase', count: 89, bgClass: 'bg-orange-500' },
];

const recentDocs = [
  { id: 1, title: 'Table 组件使用文档', category: '组件库', time: '10 分钟前' },
  { id: 2, title: '用户管理接口', category: '接口文档', time: '1 小时前' },
  { id: 3, title: 'ESLint 配置规范', category: '开发规范', time: '2 小时前' },
];

const isActive = (path: string) => route.path === path;
</script>
