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

    <div class="flex h-full">
      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h1 class="text-lg font-semibold text-slate-900 dark:text-white">智能编码助手</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">基于 AI 的代码生成、补全和优化</p>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-auto p-6 space-y-4">
          <!-- Welcome Message -->
          <div class="max-w-2xl mx-auto text-center py-12">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <UIcon name="i-lucide-sparkles" class="w-8 h-8 text-white" />
            </div>
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">开始与 AI 对话</h2>
            <p class="text-slate-500 dark:text-slate-400 mb-6">描述你想要生成的代码，AI 将为你提供帮助</p>

            <!-- Quick Prompts -->
            <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              <button
                v-for="prompt in quickPrompts"
                :key="prompt"
                class="p-3 text-left text-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="flex items-end gap-3">
            <div class="flex-1">
              <UTextarea
                v-model="inputMessage"
                placeholder="描述你想要生成的代码..."
                :rows="2"
                autoresize
                class="w-full"
              />
            </div>
            <UButton size="lg" :disabled="!inputMessage.trim()">
              <UIcon name="i-lucide-send" class="w-4 h-4" />
            </UButton>
          </div>
          <div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span>按 Ctrl + Enter 发送</span>
            <span>·</span>
            <span>支持 Vue、React、TypeScript</span>
          </div>
        </div>
      </div>

      <!-- Code Preview Panel -->
      <div class="w-96 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hidden lg:flex flex-col">
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 class="font-medium text-slate-900 dark:text-white">代码预览</h3>
        </div>
        <div class="flex-1 p-4 overflow-auto">
          <div class="text-center text-slate-400 dark:text-slate-500 py-12">
            <UIcon name="i-lucide-code-2" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>生成的代码将在这里显示</p>
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
const inputMessage = ref('');

const sidebarItems = [
  { label: '对话', icon: 'i-lucide-message-square', to: '/platform/coding' },
  { label: '代码片段', icon: 'i-lucide-code', to: '/platform/coding/snippets' },
  { label: '历史记录', icon: 'i-lucide-history', to: '/platform/coding/history' },
  { label: '收藏', icon: 'i-lucide-star', to: '/platform/coding/favorites' },
];

const quickPrompts = [
  '封装一个用户登录的接口请求',
  '生成一个带校验的表单组件',
  '写一个防抖函数',
  '创建一个分页列表组件',
];

const isActive = (path: string) => route.path === path;
</script>
