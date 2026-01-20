<script setup lang="ts">
const colorMode = useColorMode()

// Color mode
const isDark = computed(() => {
  if (colorMode.preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return colorMode.preference === 'dark'
})
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-30 dark:opacity-20">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2314b8a6%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
      </div>

      <!-- Floating shapes -->
      <div class="absolute top-20 left-20 w-32 h-32 bg-teal-200/40 dark:bg-teal-500/20 rounded-full blur-xl" />
      <div class="absolute bottom-20 right-20 w-48 h-48 bg-cyan-200/40 dark:bg-cyan-500/20 rounded-full blur-xl" />
      <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-sky-200/30 dark:bg-sky-500/15 rounded-full blur-lg" />

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-12">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg">
            <UIcon name="i-lucide-zap" class="w-6 h-6 text-white" />
          </div>
          <span class="text-2xl font-bold text-teal-700 dark:text-teal-400">Zeta</span>
        </div>

        <!-- Headline -->
        <h1 class="text-4xl xl:text-5xl font-bold text-slate-800 dark:text-white leading-tight mb-6">
          前端提效平台
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-md">
          AI 驱动的一站式前端开发工具，打通设计→编码→测试→协作全流程
        </p>

        <!-- Feature highlights -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-figma" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <span class="text-slate-700 dark:text-slate-200">设计稿智能转代码</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-code-2" class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span class="text-slate-700 dark:text-slate-200">自然语言生成高质量代码</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-book-open" class="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <span class="text-slate-700 dark:text-slate-200">团队文档智能检索问答</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
            <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold text-slate-900 dark:text-white">Zeta</span>
        </div>

        <!-- Theme toggle -->
        <div class="absolute top-6 right-6">
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="ghost"
            @click="toggleColorMode"
          />
        </div>

        <!-- Slot for login/register form -->
        <slot />
      </div>
    </div>
  </div>
</template>
