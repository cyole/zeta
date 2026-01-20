<template>
  <div class="min-h-full">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-500 dark:from-teal-600 dark:via-teal-700 dark:to-cyan-600">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white mb-2">
              {{ greeting }}，{{ user?.name || '开发者' }}
            </h1>
            <p class="text-teal-100">
              欢迎使用 Zeta 前端提效平台，开始高效开发吧
            </p>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm text-teal-200">今日使用</div>
              <div class="text-2xl font-bold text-white">12 次</div>
            </div>
            <div class="w-px h-12 bg-white/20" />
            <div class="text-right">
              <div class="text-sm text-teal-200">本月节省</div>
              <div class="text-2xl font-bold text-white">48 小时</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Quick Actions -->
      <section class="mb-10">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">快速开始</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="module in modules"
            :key="module.to"
            :to="module.to"
            class="group flex flex-col items-center p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg hover:shadow-teal-500/10 transition-all"
          >
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110',
                module.bgClass
              ]"
            >
              <UIcon :name="module.icon" class="w-6 h-6 text-white" />
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ module.label }}</span>
            <span class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ module.desc }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Stats & Activity -->
      <div class="grid lg:grid-cols-3 gap-6 mb-10">
        <!-- Usage Stats -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-semibold text-slate-900 dark:text-white">使用统计</h3>
            <UButton variant="ghost" color="neutral" size="xs">
              查看详情
              <UIcon name="i-lucide-arrow-right" class="w-3 h-3 ml-1" />
            </UButton>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <div :class="['text-3xl font-bold', stat.colorClass]">{{ stat.value }}</div>
              <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ stat.label }}</div>
              <div :class="['text-xs mt-1', stat.trend > 0 ? 'text-green-500' : 'text-slate-400']">
                <span v-if="stat.trend > 0">↑ {{ stat.trend }}%</span>
                <span v-else>—</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Usage -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">AI 额度</h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-slate-600 dark:text-slate-400">本月已用</span>
                <span class="font-medium text-slate-900 dark:text-white">1,234 / 5,000</span>
              </div>
              <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style="width: 24.68%" />
              </div>
            </div>
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600 dark:text-slate-400">剩余额度</span>
                <span class="text-lg font-bold text-teal-600 dark:text-teal-400">3,766</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Announcements -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recent Activity -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-900 dark:text-white">最近活动</h3>
            <UButton variant="ghost" color="neutral" size="xs">全部记录</UButton>
          </div>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start gap-3"
            >
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', activity.bgClass]">
                <UIcon :name="activity.icon" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ activity.title }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-900 dark:text-white">平台公告</h3>
            <UBadge color="primary" variant="soft">3 条新消息</UBadge>
          </div>
          <div class="space-y-4">
            <div
              v-for="announcement in announcements"
              :key="announcement.id"
              class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div class="flex items-center gap-2 mb-1">
                <UBadge :color="announcement.type === 'feature' ? 'primary' : announcement.type === 'update' ? 'success' : 'warning'" variant="soft" size="xs">
                  {{ announcement.type === 'feature' ? '新功能' : announcement.type === 'update' ? '更新' : '通知' }}
                </UBadge>
                <span class="text-xs text-slate-400">{{ announcement.date }}</span>
              </div>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ announcement.title }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Cards -->
      <section class="mt-10">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">核心能力</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div class="flex items-start gap-4">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', feature.bgClass]">
                <UIcon :name="feature.icon" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 class="font-medium text-slate-900 dark:text-white mb-1">{{ feature.title }}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'platform',
  middleware: 'auth',
});

const { user } = useAuth();

// Greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// Module quick actions
const modules = [
  { label: '设计转代码', desc: 'D2C', icon: 'i-lucide-figma', to: '/platform/d2c', bgClass: 'bg-gradient-to-br from-teal-500 to-cyan-500' },
  { label: '编码助手', desc: 'AI Code', icon: 'i-lucide-code-2', to: '/platform/coding', bgClass: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
  { label: '文档管理', desc: 'Docs', icon: 'i-lucide-book-open', to: '/platform/docs', bgClass: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { label: '接口协作', desc: 'API', icon: 'i-lucide-plug', to: '/platform/api', bgClass: 'bg-gradient-to-br from-orange-500 to-amber-500' },
  { label: '测试优化', desc: 'Test', icon: 'i-lucide-test-tube', to: '/platform/testing', bgClass: 'bg-gradient-to-br from-red-500 to-rose-500' },
  { label: '工程化', desc: 'DevOps', icon: 'i-lucide-settings-2', to: '/platform/engineering', bgClass: 'bg-gradient-to-br from-slate-500 to-slate-600' },
];

// Stats
const stats = [
  { label: '代码生成', value: '156', colorClass: 'text-teal-500', trend: 12 },
  { label: '文档查询', value: '89', colorClass: 'text-green-500', trend: 8 },
  { label: '接口生成', value: '34', colorClass: 'text-orange-500', trend: 5 },
  { label: '测试用例', value: '67', colorClass: 'text-cyan-500', trend: 0 },
];

// Recent activities
const recentActivities = [
  { id: 1, icon: 'i-lucide-code-2', title: '使用编码助手生成了用户列表组件', time: '10 分钟前', bgClass: 'bg-cyan-500' },
  { id: 2, icon: 'i-lucide-book-open', title: '查询了 Table 组件的分页配置文档', time: '25 分钟前', bgClass: 'bg-green-500' },
  { id: 3, icon: 'i-lucide-figma', title: '从 Figma 设计稿生成了登录页面代码', time: '1 小时前', bgClass: 'bg-teal-500' },
  { id: 4, icon: 'i-lucide-plug', title: '生成了用户管理接口的 Mock 数据', time: '2 小时前', bgClass: 'bg-orange-500' },
];

// Announcements
const announcements = [
  { id: 1, type: 'feature', title: '新增 Claude 3.5 模型支持，代码生成更智能', date: '2024-01-15' },
  { id: 2, type: 'update', title: '文档管理模块升级，支持多版本文档对比', date: '2024-01-12' },
  { id: 3, type: 'notice', title: '本周六凌晨 2-4 点进行系统维护', date: '2024-01-10' },
];

// Features
const features = [
  { title: '智能代码生成', description: '基于 AI 的代码生成能力，支持自然语言描述转代码', icon: 'i-lucide-wand-2', bgClass: 'bg-teal-500' },
  { title: '团队知识库', description: '统一管理组件文档、接口文档，AI 智能检索', icon: 'i-lucide-library', bgClass: 'bg-emerald-500' },
  { title: '设计稿识别', description: '自动识别 Figma 设计稿，精准生成组件代码', icon: 'i-lucide-scan', bgClass: 'bg-cyan-500' },
  { title: '接口 Mock', description: '一键生成 Mock 数据，支持自定义规则', icon: 'i-lucide-database', bgClass: 'bg-orange-500' },
  { title: '代码质量检测', description: '自动检测代码问题，提供优化建议', icon: 'i-lucide-shield-check', bgClass: 'bg-blue-500' },
  { title: '项目脚手架', description: '快速创建项目，内置最佳实践配置', icon: 'i-lucide-folder-plus', bgClass: 'bg-rose-500' },
];
</script>
