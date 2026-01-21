<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { isAuthenticated, fetchUser } = useAuth()

onMounted(() => {
  fetchUser()
})

const features = [
  {
    icon: 'i-lucide-figma',
    title: '设计转代码',
    description: '智能识别 Figma 设计稿，自动匹配组件库，精准生成 Vue/React 代码。',
  },
  {
    icon: 'i-lucide-code-2',
    title: '智能编码助手',
    description: '自然语言转代码，代码补全与优化，组件快速生成，实时语法纠错。',
  },
  {
    icon: 'i-lucide-book-open',
    title: '文档智能管理',
    description: '自然语言检索文档，多轮问答，支持组件库、接口文档智能检索。',
  },
  {
    icon: 'i-lucide-plug',
    title: '接口协作助手',
    description: '自动解析 Swagger 文档，生成前端代码、Mock 数据和参数校验。',
  },
  {
    icon: 'i-lucide-test-tube',
    title: '测试与优化',
    description: 'AI 生成测试用例，性能优化建议，兼容性检查和代码评审。',
  },
  {
    icon: 'i-lucide-settings-2',
    title: '项目工程化',
    description: '智能项目初始化，配置优化建议，依赖升级管理和安全检测。',
  },
]

const quickLinks = [
  { title: '设计转代码', desc: 'Figma 设计稿智能转代码', icon: 'i-lucide-figma', to: '/platform/d2c', bgClass: 'bg-gradient-to-br from-teal-500 to-cyan-500' },
  { title: '编码助手', desc: '自然语言生成代码', icon: 'i-lucide-code-2', to: '/platform/coding', bgClass: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
  { title: '文档管理', desc: '智能检索文档', icon: 'i-lucide-book-open', to: '/platform/docs', bgClass: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { title: '接口协作', desc: '解析接口文档', icon: 'i-lucide-plug', to: '/platform/api', bgClass: 'bg-gradient-to-br from-orange-500 to-amber-500' },
  { title: '测试优化', desc: 'AI 生成测试用例', icon: 'i-lucide-test-tube', to: '/platform/testing', bgClass: 'bg-gradient-to-br from-red-500 to-rose-500' },
  { title: '工程化', desc: '项目初始化配置', icon: 'i-lucide-settings-2', to: '/platform/engineering', bgClass: 'bg-gradient-to-br from-slate-500 to-slate-600' },
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950">
    <!-- Navigation -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
            </div>
            <span class="font-bold text-xl text-slate-900 dark:text-white">Zeta</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <ColorModeToggle />
            <template v-if="isAuthenticated">
              <UButton to="/platform" color="primary">
                <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4 mr-1.5" />
                打开工作台
              </UButton>
            </template>
            <template v-else>
              <UButton to="/auth/login" variant="ghost" class="hidden sm:inline-flex">
                登录
              </UButton>
              <UButton to="/platform" color="primary">
                进入工作台
              </UButton>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Grid background -->
      <div class="hero-grid absolute inset-0" />

      <!-- Gradient overlays -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-400/30 rounded-full blur-3xl" />
        <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-3xl" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-100/50 to-cyan-100/50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full blur-3xl" />
        <!-- Bottom fade -->
        <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 mb-8">
            <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span class="text-sm text-teal-700 dark:text-teal-300">AI 驱动的前端提效平台</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            让 AI 成为你的
            <span class="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">智能协作助手</span>
          </h1>

          <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            以 AI 为中枢，打通设计→编码→测试→协作全流程，降低门槛、提升效率、统一规范。
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <UButton to="/platform" size="xl" class="w-full sm:w-auto">
              <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5 mr-2" />
              进入工作台
            </UButton>
            <UButton to="/auth/login" size="xl" variant="outline" color="neutral" class="w-full sm:w-auto">
              登录账号
            </UButton>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
        <span class="text-xs">向下滚动</span>
        <div class="w-6 h-10 border-2 border-slate-300 dark:border-slate-700 rounded-full flex justify-center pt-2">
          <div class="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            核心功能
          </h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            为前端开发者量身打造的一站式提效工具
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UIcon :name="feature.icon" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-slate-600 dark:text-slate-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section id="workflow" class="py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            快速开始
          </h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            选择你需要的功能模块，立即开始使用
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg transition-all"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" :class="[link.bgClass]">
              <UIcon :name="link.icon" class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="font-semibold text-slate-900 dark:text-white">
                {{ link.title }}
              </div>
              <div class="text-sm text-slate-500">
                {{ link.desc }}
              </div>
            </div>
            <UIcon name="i-lucide-arrow-right" class="w-5 h-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 p-12 lg:p-16 overflow-hidden">
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div class="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          <div class="relative text-center">
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
              开始提升开发效率
            </h2>
            <p class="text-lg text-teal-100 max-w-2xl mx-auto mb-8">
              立即进入工作台，体验 AI 驱动的前端开发工具
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <UButton to="/platform" size="xl" color="neutral" variant="solid" class="bg-white text-teal-600 hover:bg-slate-100">
                进入工作台
              </UButton>
              <UButton to="/auth/login" size="xl" variant="outline" class="text-white border-white/30 hover:bg-white/10">
                登录账号
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-zap" class="w-4 h-4 text-white" />
            </div>
            <span class="font-semibold text-slate-900 dark:text-white">Zeta</span>
          </div>

          <div class="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="#" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">使用文档</a>
            <a href="#" class="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">问题反馈</a>
          </div>

          <div class="text-sm text-slate-500">
            Zeta 前端提效平台
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
