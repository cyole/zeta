<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  middleware: 'auth',
})
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        测试与优化助手
      </h1>
      <p class="text-neutral-500 dark:text-neutral-400">
        测试用例生成、性能优化建议、兼容性检查
      </p>
    </div>

    <!-- Stats -->
    <div class="grid md:grid-cols-4 gap-4 mb-8">
      <div class="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">测试覆盖率</span>
          <UBadge color="success" variant="soft">
            +5%
          </UBadge>
        </div>
        <div class="text-2xl font-bold text-neutral-900 dark:text-white">
          78.5%
        </div>
      </div>
      <div class="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">测试用例</span>
          <UBadge color="primary" variant="soft">
            +12
          </UBadge>
        </div>
        <div class="text-2xl font-bold text-neutral-900 dark:text-white">
          256
        </div>
      </div>
      <div class="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">性能得分</span>
          <UBadge color="warning" variant="soft">
            待优化
          </UBadge>
        </div>
        <div class="text-2xl font-bold text-neutral-900 dark:text-white">
          85
        </div>
      </div>
      <div class="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">问题数量</span>
          <UBadge color="error" variant="soft">
            3 个
          </UBadge>
        </div>
        <div class="text-2xl font-bold text-neutral-900 dark:text-white">
          12
        </div>
      </div>
    </div>

    <!-- Main Actions -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <!-- Test Generation -->
      <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
            <UIcon name="i-lucide-test-tube" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-white">
              测试用例生成
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              AI 智能生成单元测试
            </p>
          </div>
        </div>
        <UTextarea
          placeholder="粘贴需要生成测试的代码..."
          :rows="4"
          class="w-full mb-3"
        />
        <UButton class="w-full" icon="i-lucide-sparkles">
          生成测试用例
        </UButton>
      </div>

      <!-- Code Review -->
      <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-secondary-500 flex items-center justify-center">
            <UIcon name="i-lucide-scan" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-white">
              代码评审
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              检查代码质量和潜在问题
            </p>
          </div>
        </div>
        <UTextarea
          placeholder="粘贴需要评审的代码..."
          :rows="4"
          class="w-full mb-3"
        />
        <UButton class="w-full" icon="i-lucide-shield-check">
          开始评审
        </UButton>
      </div>
    </div>

    <!-- Performance & Compatibility -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 class="font-semibold text-neutral-900 dark:text-white mb-4">
          性能优化建议
        </h3>
        <div class="space-y-3">
          <div class="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                Bundle 体积过大
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                lodash 建议按需引入
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-neutral-900 dark:text-white">
                可开启 Tree Shaking
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                预计减少 15% 体积
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 class="font-semibold text-neutral-900 dark:text-white mb-4">
          兼容性检查
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div class="flex items-center gap-2">
              <UIcon name="i-simple-icons-googlechrome" class="w-5 h-5 text-neutral-600" />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Chrome 90+</span>
            </div>
            <UBadge color="success" variant="soft">
              兼容
            </UBadge>
          </div>
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div class="flex items-center gap-2">
              <UIcon name="i-simple-icons-firefox" class="w-5 h-5 text-neutral-600" />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Firefox 85+</span>
            </div>
            <UBadge color="success" variant="soft">
              兼容
            </UBadge>
          </div>
          <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div class="flex items-center gap-2">
              <UIcon name="i-simple-icons-safari" class="w-5 h-5 text-neutral-600" />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Safari 14+</span>
            </div>
            <UBadge color="warning" variant="soft">
              部分兼容
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
