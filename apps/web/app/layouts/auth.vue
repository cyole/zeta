<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);" />
      </div>

      <!-- Floating shapes -->
      <div class="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      <div class="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-xl" />
      <div class="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-lg" />

      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center px-12 xl:px-20">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-12">
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <UIcon name="i-lucide-zap" class="w-6 h-6 text-white" />
          </div>
          <span class="text-2xl font-bold text-white">Zeta</span>
        </div>

        <!-- Headline -->
        <h1 class="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
          前端提效平台
        </h1>
        <p class="text-lg text-white/80 mb-10 max-w-md">
          AI 驱动的一站式前端开发工具，打通设计→编码→测试→协作全流程
        </p>

        <!-- Feature highlights -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-figma" class="w-4 h-4 text-white" />
            </div>
            <span class="text-white/90">设计稿智能转代码</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-code-2" class="w-4 h-4 text-white" />
            </div>
            <span class="text-white/90">自然语言生成高质量代码</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <UIcon name="i-lucide-book-open" class="w-4 h-4 text-white" />
            </div>
            <span class="text-white/90">团队文档智能检索问答</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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

        <!-- Footer -->
        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          继续即表示您同意我们的
          <a href="#" class="text-teal-500 hover:underline">服务条款</a>
          和
          <a href="#" class="text-teal-500 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

// Color mode
const isDark = computed(() => {
  if (colorMode.preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return colorMode.preference === 'dark';
});
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark';
};
</script>
