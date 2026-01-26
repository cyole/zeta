<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  middleware: 'auth',
})

const inputMessage = ref('')

const quickPrompts = [
  '封装一个用户登录的接口请求',
  '生成一个带校验的表单组件',
  '写一个防抖函数',
  '创建一个分页列表组件',
]
</script>

<template>
  <div class="flex h-full">
    <!-- Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h1 class="text-lg font-semibold text-neutral-900 dark:text-white">
          智能编码助手
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          基于 AI 的代码生成、补全和优化
        </p>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-auto p-6 space-y-4">
        <!-- Welcome Message -->
        <div class="max-w-2xl mx-auto text-center py-12">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-secondary-500 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-sparkles" class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            开始与 AI 对话
          </h2>
          <p class="text-neutral-500 dark:text-neutral-400 mb-6">
            描述你想要生成的代码，AI 将为你提供帮助
          </p>

          <!-- Quick Prompts -->
          <div class="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              class="p-3 text-left text-sm bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              {{ prompt }}
            </button>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
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
          <UButton size="lg" :disabled="!inputMessage.trim()" icon="i-lucide-send" />
        </div>
        <div class="flex items-center gap-4 mt-3 text-xs text-neutral-400">
          <span>按 Ctrl + Enter 发送</span>
          <span>·</span>
          <span>支持 Vue、React、TypeScript</span>
        </div>
      </div>
    </div>

    <!-- Code Preview Panel -->
    <div class="w-96 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hidden lg:flex flex-col">
      <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h3 class="font-medium text-neutral-900 dark:text-white">
          代码预览
        </h3>
      </div>
      <div class="flex-1 p-4 overflow-auto">
        <div class="text-center text-neutral-400 dark:text-neutral-500 py-12">
          <UIcon name="i-lucide-code-2" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>生成的代码将在这里显示</p>
        </div>
      </div>
    </div>
  </div>
</template>
