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
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">测试与优化助手</h1>
        <p class="text-slate-500 dark:text-slate-400">测试用例生成、性能优化建议、兼容性检查</p>
      </div>

      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">测试覆盖率</span>
            <UBadge color="success" variant="soft">+5%</UBadge>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white">78.5%</div>
        </div>
        <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">测试用例</span>
            <UBadge color="primary" variant="soft">+12</UBadge>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white">256</div>
        </div>
        <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">性能得分</span>
            <UBadge color="warning" variant="soft">待优化</UBadge>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white">85</div>
        </div>
        <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">问题数量</span>
            <UBadge color="error" variant="soft">3 个</UBadge>
          </div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white">12</div>
        </div>
      </div>

      <!-- Main Actions -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Test Generation -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <UIcon name="i-lucide-test-tube" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-slate-900 dark:text-white">测试用例生成</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">AI 智能生成单元测试</p>
            </div>
          </div>
          <UTextarea
            placeholder="粘贴需要生成测试的代码..."
            :rows="4"
            class="w-full mb-3"
          />
          <UButton class="w-full">
            <UIcon name="i-lucide-sparkles" class="w-4 h-4 mr-2" />
            生成测试用例
          </UButton>
        </div>

        <!-- Code Review -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-scan" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-medium text-slate-900 dark:text-white">代码评审</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">检查代码质量和潜在问题</p>
            </div>
          </div>
          <UTextarea
            placeholder="粘贴需要评审的代码..."
            :rows="4"
            class="w-full mb-3"
          />
          <UButton class="w-full">
            <UIcon name="i-lucide-shield-check" class="w-4 h-4 mr-2" />
            开始评审
          </UButton>
        </div>
      </div>

      <!-- Performance & Compatibility -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">性能优化建议</h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Bundle 体积过大</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">lodash 建议按需引入</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">可开启 Tree Shaking</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">预计减少 15% 体积</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">兼容性检查</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-googlechrome" class="w-5 h-5 text-slate-600" />
                <span class="text-sm text-slate-700 dark:text-slate-300">Chrome 90+</span>
              </div>
              <UBadge color="success" variant="soft">兼容</UBadge>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-firefox" class="w-5 h-5 text-slate-600" />
                <span class="text-sm text-slate-700 dark:text-slate-300">Firefox 85+</span>
              </div>
              <UBadge color="success" variant="soft">兼容</UBadge>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-safari" class="w-5 h-5 text-slate-600" />
                <span class="text-sm text-slate-700 dark:text-slate-300">Safari 14+</span>
              </div>
              <UBadge color="warning" variant="soft">部分兼容</UBadge>
            </div>
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
  { label: '概览', icon: 'i-lucide-layout-dashboard', to: '/platform/testing' },
  { label: '测试生成', icon: 'i-lucide-test-tube', to: '/platform/testing/generate' },
  { label: '代码评审', icon: 'i-lucide-scan', to: '/platform/testing/review' },
  { label: '性能分析', icon: 'i-lucide-gauge', to: '/platform/testing/performance' },
];

const isActive = (path: string) => route.path === path;
</script>
