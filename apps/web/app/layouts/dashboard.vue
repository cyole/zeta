<template>
  <div class="flex h-screen bg-slate-100 dark:bg-slate-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'sidebar-wrapper flex flex-col transition-all duration-300 border-r border-teal-200/50 dark:border-teal-800/50',
        sidebarCollapsed ? 'w-16' : 'w-64'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-teal-200/30 dark:border-teal-800/30">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
          <UIcon name="i-lucide-zap" class="w-5 h-5 text-white" />
        </div>
        <div v-if="!sidebarCollapsed" class="flex flex-col">
          <span class="font-bold text-slate-800 dark:text-white">Zeta</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">v0.1.0</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <!-- Main menu -->
        <div class="space-y-1">
          <NuxtLink
            v-for="item in mainNavItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'sidebar-nav-item',
              { active: isActiveRoute(item.to) }
            ]"
          >
            <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Admin section -->
        <template v-if="isAdmin">
          <div v-if="!sidebarCollapsed" class="sidebar-section-label mt-6">管理</div>
          <div v-else class="my-4 border-t border-teal-200/50 dark:border-teal-700/50" />
          <div class="space-y-1">
            <NuxtLink
              v-for="item in adminNavItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'sidebar-nav-item',
                { active: isActiveRoute(item.to) }
              ]"
            >
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </template>

        <!-- My account section -->
        <div v-if="!sidebarCollapsed" class="sidebar-section-label mt-6">我的账户</div>
        <div v-else class="my-4 border-t border-teal-200/50 dark:border-teal-700/50" />
        <div class="space-y-1">
          <NuxtLink
            v-for="item in accountNavItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'sidebar-nav-item',
              { active: isActiveRoute(item.to) }
            ]"
          >
            <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer -->
      <div class="px-3 py-4 border-t border-teal-200/30 dark:border-teal-800/30 space-y-2">
        <!-- Dark mode toggle -->
        <button
          @click="toggleColorMode"
          :class="[
            'sidebar-nav-item w-full',
          ]"
        >
          <UIcon :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'" class="w-5 h-5 shrink-0" />
          <span v-if="!sidebarCollapsed">{{ isDark ? '深色模式' : '浅色模式' }}</span>
        </button>

        <!-- Collapse toggle -->
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="sidebar-nav-item w-full"
        >
          <UIcon :name="sidebarCollapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'" class="w-5 h-5 shrink-0" />
          <span v-if="!sidebarCollapsed">收起</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top navbar -->
      <header class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <!-- Page title will be set by pages -->
          <div>
            <h1 class="text-lg font-semibold text-slate-800 dark:text-white">{{ pageTitle }}</h1>
            <p v-if="pageSubtitle" class="text-xs text-slate-500">{{ pageSubtitle }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Docs link -->
          <a href="#" class="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
            <UIcon name="i-lucide-file-text" class="w-4 h-4" />
            <span>文档</span>
          </a>

          <!-- Language -->
          <div class="flex items-center gap-1 text-sm text-slate-500">
            <span class="w-5 h-4 rounded bg-red-500 flex items-center justify-center text-white text-xs">ZH</span>
          </div>

          <!-- Notifications -->
          <div class="relative">
            <UButton icon="i-lucide-message-square" color="neutral" variant="ghost" size="sm" />
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
          </div>

          <!-- Balance -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
            <UIcon name="i-lucide-wallet" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span class="text-sm font-medium text-teal-700 dark:text-teal-300">$995.61</span>
          </div>

          <!-- User dropdown -->
          <UDropdownMenu :items="userMenuItems">
            <button class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-2 py-1 transition-colors">
              <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="sm" />
              <div v-if="user" class="text-left">
                <p class="text-sm font-medium text-slate-800 dark:text-white">{{ user.name }}</p>
                <p class="text-xs text-slate-500">{{ userRoleLabel }}</p>
              </div>
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-slate-400" />
            </button>
          </UDropdownMenu>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();
const { isAdmin } = usePermissions();
const router = useRouter();
const route = useRoute();
const colorMode = useColorMode();

const sidebarCollapsed = ref(false);

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

// Page info
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/dashboard/profile': '个人资料',
    '/admin/users': '用户管理',
    '/admin/roles': '角色管理',
  };
  return titles[route.path] || 'Zeta';
});

const pageSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    '/admin/users': '管理用户账户和权限',
    '/admin/roles': '管理角色和权限',
    '/dashboard/profile': '管理个人账户设置',
  };
  return subtitles[route.path] || '';
});

// User role label
const userRoleLabel = computed(() => {
  const roles = user.value?.roles;
  if (!roles || roles.length === 0) return '用户';
  const role = roles[0];
  return role?.displayName || role?.name || '用户';
});

// Navigation items
const mainNavItems = [
  { label: '仪表盘', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
];

const adminNavItems = [
  { label: '用户管理', icon: 'i-lucide-users', to: '/admin/users' },
  { label: '角色管理', icon: 'i-lucide-shield', to: '/admin/roles' },
];

const accountNavItems = [
  { label: '个人资料', icon: 'i-lucide-user', to: '/dashboard/profile' },
];

// Check active route
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: '个人设置',
      icon: 'i-lucide-user',
      click: () => router.push('/dashboard/profile'),
    },
  ],
  [
    {
      label: '退出登录',
      icon: 'i-lucide-log-out',
      click: () => logout(),
    },
  ],
]);
</script>
