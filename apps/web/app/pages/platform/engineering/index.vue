<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">项目工程化工具</h1>
      <p class="text-slate-500 dark:text-slate-400">项目模板生成、配置文件优化、依赖管理</p>
    </div>

    <!-- Project Init -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <UIcon name="i-lucide-folder-plus" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="font-medium text-slate-900 dark:text-white">项目初始化</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">描述你的项目需求，AI 帮你生成初始化命令</p>
        </div>
      </div>
      <UTextarea
        v-model="projectDesc"
        placeholder="例如：创建一个 Vue3 + TS + Antd + Pinia 的中后台项目，支持 ESLint + Prettier + Husky"
        :rows="3"
        class="w-full mb-4"
      />
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="options.eslint" />
            <span class="text-sm text-slate-600 dark:text-slate-400">ESLint</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="options.prettier" />
            <span class="text-sm text-slate-600 dark:text-slate-400">Prettier</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="options.husky" />
            <span class="text-sm text-slate-600 dark:text-slate-400">Husky</span>
          </label>
        </div>
        <UButton>
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 mr-2" />
          生成初始化命令
        </UButton>
      </div>
    </div>

    <!-- Quick Tools -->
    <div class="grid md:grid-cols-3 gap-4 mb-8">
      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-settings" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">配置优化</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">上传 vite.config 获取优化建议</p>
      </div>

      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-package" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">依赖检查</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">分析 package.json 安全漏洞</p>
      </div>

      <div class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UIcon name="i-lucide-arrow-up-circle" class="w-5 h-5 text-white" />
        </div>
        <h3 class="font-medium text-slate-900 dark:text-white mb-1">依赖升级</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">智能分析可升级的依赖</p>
      </div>
    </div>

    <!-- Templates -->
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">项目模板</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in templates"
          :key="template.name"
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
        >
          <div class="flex items-center gap-3 mb-3">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', template.bgClass]">
              <UIcon :name="template.icon" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 class="font-medium text-slate-900 dark:text-white">{{ template.name }}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ template.stack }}</p>
            </div>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">{{ template.description }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <UIcon name="i-lucide-download" class="w-3 h-3" />
              <span>{{ template.downloads }}</span>
            </div>
            <UButton size="xs" variant="soft">使用模板</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'platform',
  middleware: 'auth',
});

const projectDesc = ref('');
const options = reactive({
  eslint: true,
  prettier: true,
  husky: true,
});

const templates = [
  {
    name: 'Vue3 Admin',
    stack: 'Vue3 + TS + Pinia',
    description: '企业级中后台管理系统模板',
    icon: 'i-simple-icons-vuedotjs',
    bgClass: 'bg-green-500',
    downloads: '2.3k',
  },
  {
    name: 'Nuxt3 Starter',
    stack: 'Nuxt3 + TS + UnoCSS',
    description: 'Nuxt3 全栈应用启动模板',
    icon: 'i-simple-icons-nuxtdotjs',
    bgClass: 'bg-emerald-500',
    downloads: '1.8k',
  },
  {
    name: 'React Dashboard',
    stack: 'React + TS + Zustand',
    description: '现代化 React 管理后台',
    icon: 'i-simple-icons-react',
    bgClass: 'bg-blue-500',
    downloads: '1.5k',
  },
  {
    name: 'Mobile H5',
    stack: 'Vue3 + Vant + TS',
    description: '移动端 H5 项目模板',
    icon: 'i-lucide-smartphone',
    bgClass: 'bg-purple-500',
    downloads: '986',
  },
  {
    name: 'Mini Program',
    stack: 'uni-app + TS',
    description: '跨端小程序开发模板',
    icon: 'i-simple-icons-wechat',
    bgClass: 'bg-green-600',
    downloads: '756',
  },
  {
    name: 'Component Lib',
    stack: 'Vue3 + Vite + Vitest',
    description: '组件库开发脚手架',
    icon: 'i-lucide-component',
    bgClass: 'bg-orange-500',
    downloads: '432',
  },
];
</script>
