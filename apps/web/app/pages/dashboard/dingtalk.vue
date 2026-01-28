<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const api = useApi()
const toast = useToast()

// 配置信息
interface DingTalkConfig {
  appKey: string | null
  callbackUrl: string
  scope: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  isConfigured: boolean
}

// 绑定状态
interface BindingStatus {
  isBound: boolean
  message?: string
  providerId?: string
  hasAccessToken?: boolean
  hasRefreshToken?: boolean
  createdAt?: string
  updatedAt?: string
}

// 通用测试结果
interface TestResult {
  providerId: string
  success?: boolean
  data?: any
  error?: string
  details?: string
}

// 状态
const loading = ref({
  config: false,
  binding: false,
  userInfo: false,
  refreshToken: false,
  orgInfo: false,
  departments: false,
  subDepartments: false,
  deptUsers: false,
  userDetails: false,
  appScope: false,
})

// 输入参数
const deptIdInput = ref('')
const userIdInput = ref('')

// 数据
const config = ref<DingTalkConfig | null>(null)
const bindingStatus = ref<BindingStatus | null>(null)

const userInfoResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const refreshTokenResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const orgInfoResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const departmentsResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const subDepartmentsResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const deptUsersResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const userDetailsResult = ref<{ accounts: number, results: TestResult[] } | null>(null)
const appScopeResult = ref<{ accounts: number, results: TestResult[] } | null>(null)

// 展开状态
const expandedStates = ref<Record<string, Set<number>>>({})

function getExpanded(key: string) {
  if (!expandedStates.value[key]) {
    expandedStates.value[key] = new Set()
  }
  return expandedStates.value[key]
}

function toggleExpanded(key: string, idx: number) {
  const set = getExpanded(key)
  if (set.has(idx)) {
    set.delete(idx)
  }
  else {
    set.add(idx)
  }
}

// 获取配置信息
async function fetchConfig() {
  loading.value.config = true
  try {
    config.value = await api.get<DingTalkConfig>('/oauth/dingtalk/test/config')
  }
  catch (error: any) {
    toast.add({
      title: '获取配置失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.config = false
  }
}

// 获取绑定状态
async function fetchBindingStatus() {
  loading.value.binding = true
  try {
    bindingStatus.value = await api.get<BindingStatus>('/oauth/dingtalk/test/binding-status')
  }
  catch (error: any) {
    toast.add({
      title: '获取绑定状态失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.binding = false
  }
}

// 测试获取用户信息
async function testGetUserInfo() {
  loading.value.userInfo = true
  userInfoResult.value = null
  try {
    userInfoResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/user-info')
    toast.add({
      title: '测试完成',
      description: `成功获取 ${userInfoResult.value.results.filter(r => r.success).length}/${userInfoResult.value.accounts} 个账号的用户信息`,
      color: userInfoResult.value.results.some(r => r.success) ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.userInfo = false
  }
}

// 测试刷新令牌
async function testRefreshToken() {
  loading.value.refreshToken = true
  refreshTokenResult.value = null
  try {
    refreshTokenResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/token')
    toast.add({
      title: '测试完成',
      description: `成功刷新 ${refreshTokenResult.value.results.filter(r => r.success).length}/${refreshTokenResult.value.accounts} 个账号的令牌`,
      color: refreshTokenResult.value.results.some(r => r.success) ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.refreshToken = false
  }
}

// 测试获取企业信息
async function testGetOrgInfo() {
  loading.value.orgInfo = true
  orgInfoResult.value = null
  try {
    orgInfoResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/organization-info')
    const successCount = orgInfoResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${orgInfoResult.value.accounts} 个企业信息`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.orgInfo = false
  }
}

// 测试获取部门列表
async function testGetDepartments() {
  loading.value.departments = true
  departmentsResult.value = null
  try {
    departmentsResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/departments')
    const successCount = departmentsResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${departmentsResult.value.accounts} 个部门列表`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.departments = false
  }
}

// 测试获取子部门列表
async function testGetSubDepartments() {
  loading.value.subDepartments = true
  subDepartmentsResult.value = null
  try {
    subDepartmentsResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/sub-departments', {
      deptId: deptIdInput.value || undefined,
    })
    const successCount = subDepartmentsResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${subDepartmentsResult.value.accounts} 个子部门列表`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.subDepartments = false
  }
}

// 测试获取部门用户
async function testGetDeptUsers() {
  loading.value.deptUsers = true
  deptUsersResult.value = null
  try {
    deptUsersResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/department-users', {
      deptId: deptIdInput.value || undefined,
    })
    const successCount = deptUsersResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${deptUsersResult.value.accounts} 个部门用户`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.deptUsers = false
  }
}

// 测试获取用户详细信息
async function testGetUserDetails() {
  loading.value.userDetails = true
  userDetailsResult.value = null
  try {
    userDetailsResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/user-details', {
      userId: userIdInput.value || undefined,
    })
    const successCount = userDetailsResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${userDetailsResult.value.accounts} 个用户详细信息`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.userDetails = false
  }
}

// 测试获取应用可见范围
async function testGetAppScope() {
  loading.value.appScope = true
  appScopeResult.value = null
  try {
    appScopeResult.value = await api.post<{ accounts: number, results: TestResult[] }>('/oauth/dingtalk/test/app-scope')
    const successCount = appScopeResult.value.results.filter(r => r.success).length
    toast.add({
      title: '测试完成',
      description: `成功获取 ${successCount}/${appScopeResult.value.accounts} 个应用可见范围`,
      color: successCount > 0 ? 'success' : 'warning',
    })
  }
  catch (error: any) {
    toast.add({
      title: '测试失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    loading.value.appScope = false
  }
}

// 页面加载时获取配置和绑定状态
onMounted(() => {
  fetchConfig()
  fetchBindingStatus()
})

// JSON 格式化显示
function formatJson(data: unknown) {
  return JSON.stringify(data, null, 2)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        钉钉能力测试
      </h1>
      <p class="text-neutral-500">
        测试钉钉接口调用能力
      </p>
    </div>

    <!-- 未绑定提示 -->
    <UAlert
      v-if="bindingStatus && !bindingStatus.isBound"
      icon="i-lucide-alert-triangle"
      color="warning"
      variant="subtle"
      title="未绑定钉钉账户"
      description="请先在「账号设置」中绑定钉钉账户后，再进行接口测试。"
    >
      <template #actions>
        <UButton to="/settings" color="warning" variant="solid" size="xs">
          前往绑定
        </UButton>
      </template>
    </UAlert>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 配置信息 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              配置信息
            </h3>
            <UButton
              icon="i-lucide-refresh"
              size="xs"
              variant="ghost"
              :loading="loading.config"
              @click="fetchConfig"
            />
          </div>
        </template>
        <div v-if="config" class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">配置状态</span>
            <UBadge
              :color="config.isConfigured ? 'success' : 'error'"
              variant="subtle"
            >
              {{ config.isConfigured ? '已配置' : '未配置' }}
            </UBadge>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">AppKey</span>
            <code class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
              {{ config.appKey || '未设置' }}
            </code>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">回调地址</span>
            <code class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded break-all max-w-[200px]">
              {{ config.callbackUrl || '未设置' }}
            </code>
          </div>
        </div>
        <div v-else class="flex items-center justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      </UCard>

      <!-- 绑定状态 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              绑定状态
            </h3>
            <UButton
              icon="i-lucide-refresh"
              size="xs"
              variant="ghost"
              :loading="loading.binding"
              @click="fetchBindingStatus"
            />
          </div>
        </template>
        <div v-if="bindingStatus" class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
            <span class="text-sm text-neutral-600 dark:text-neutral-400">绑定状态</span>
            <UBadge
              :color="bindingStatus.isBound ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ bindingStatus.isBound ? '已绑定' : '未绑定' }}
            </UBadge>
          </div>
          <template v-if="bindingStatus.isBound">
            <div class="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-800">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">UnionID</span>
              <code class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                {{ bindingStatus.providerId }}
              </code>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">访问令牌</span>
              <UBadge
                :color="bindingStatus.hasAccessToken ? 'success' : 'error'"
                variant="subtle"
              >
                {{ bindingStatus.hasAccessToken ? '有效' : '无效' }}
              </UBadge>
            </div>
          </template>
          <div v-else class="text-center py-4">
            <p class="text-sm text-neutral-500">
              {{ bindingStatus.message }}
            </p>
          </div>
        </div>
        <div v-else class="flex items-center justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      </UCard>
    </div>

    <!-- 基础能力测试 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-neutral-900 dark:text-white">
          基础能力测试
        </h3>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <!-- 获取用户信息 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <UIcon name="i-lucide-user" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取用户信息
              </p>
              <p class="text-xs text-neutral-500">
                获取当前登录用户的基本信息
              </p>
            </div>
          </div>
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.userInfo"
            :disabled="!bindingStatus?.isBound"
            @click="testGetUserInfo"
          >
            测试
          </UButton>
          <div v-if="userInfoResult" class="space-y-2">
            <UBadge :color="userInfoResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ userInfoResult.results.filter(r => r.success).length }}/{{ userInfoResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in userInfoResult.results" :key="`ui-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    @click="toggleExpanded('userInfo', idx)"
                  >
                    <span class="text-sm font-medium">
                      {{ result.success ? '✓' : '✗' }} {{ result.data?.nick || result.providerId }}
                    </span>
                    <UIcon
                      :name="getExpanded('userInfo').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400"
                    />
                  </button>
                  <div v-if="getExpanded('userInfo').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- 刷新访问令牌 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <UIcon name="i-lucide-refresh-cw" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                刷新访问令牌
              </p>
              <p class="text-xs text-neutral-500">
                使用 refresh_token 获取新的访问令牌
              </p>
            </div>
          </div>
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.refreshToken"
            :disabled="!bindingStatus?.isBound"
            @click="testRefreshToken"
          >
            测试
          </UButton>
          <div v-if="refreshTokenResult" class="space-y-2">
            <UBadge :color="refreshTokenResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ refreshTokenResult.results.filter(r => r.success).length }}/{{ refreshTokenResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in refreshTokenResult.results" :key="`rt-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    @click="toggleExpanded('refreshToken', idx)"
                  >
                    <span class="text-sm font-medium">
                      {{ result.success ? '✓' : '✗' }} {{ result.providerId }}
                    </span>
                    <UIcon
                      :name="getExpanded('refreshToken').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400"
                    />
                  </button>
                  <div v-if="getExpanded('refreshToken').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 组织架构测试 -->
    <UCard>
      <template #header>
        <h3 class="font-semibold text-neutral-900 dark:text-white">
          组织架构能力测试
        </h3>
      </template>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- 获取企业信息 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <UIcon name="i-lucide-building-2" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取企业信息
              </p>
              <p class="text-xs text-neutral-500">
                获取企业基本信息
              </p>
            </div>
          </div>
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.orgInfo"
            :disabled="!bindingStatus?.isBound"
            @click="testGetOrgInfo"
          >
            测试
          </UButton>
          <div v-if="orgInfoResult" class="space-y-2">
            <UBadge :color="orgInfoResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ orgInfoResult.results.filter(r => r.success).length }}/{{ orgInfoResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in orgInfoResult.results" :key="`org-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    @click="toggleExpanded('orgInfo', idx)"
                  >
                    <span class="text-sm font-medium truncate">
                      {{ result.success ? '✓' : '✗' }} {{ result.data?.name || result.providerId }}
                    </span>
                    <UIcon
                      :name="getExpanded('orgInfo').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400 shrink-0"
                    />
                  </button>
                  <div v-if="getExpanded('orgInfo').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- 获取部门列表 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <UIcon name="i-lucide-sitemap" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取部门列表
              </p>
              <p class="text-xs text-neutral-500">
                获取企业所有部门列表
              </p>
            </div>
          </div>
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.departments"
            :disabled="!bindingStatus?.isBound"
            @click="testGetDepartments"
          >
            测试
          </UButton>
          <div v-if="departmentsResult" class="space-y-2">
            <UBadge :color="departmentsResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ departmentsResult.results.filter(r => r.success).length }}/{{ departmentsResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in departmentsResult.results" :key="`dept-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    @click="toggleExpanded('departments', idx)"
                  >
                    <span class="text-sm font-medium truncate">
                      {{ result.success ? `✓ ${result.data?.totalCount || 0} 个部门` : `✗ ${result.providerId}` }}
                    </span>
                    <UIcon
                      :name="getExpanded('departments').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400 shrink-0"
                    />
                  </button>
                  <div v-if="getExpanded('departments').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- 获取子部门列表 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <UIcon name="i-lucide-layers" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取子部门
              </p>
              <p class="text-xs text-neutral-500">
                获取指定部门的子部门
              </p>
            </div>
          </div>
          <UInput
            v-model="deptIdInput"
            placeholder="父部门ID (默认1)"
            size="sm"
          />
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.subDepartments"
            :disabled="!bindingStatus?.isBound"
            @click="testGetSubDepartments"
          >
            测试
          </UButton>
          <div v-if="subDepartmentsResult" class="space-y-2">
            <UBadge :color="subDepartmentsResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ subDepartmentsResult.results.filter(r => r.success).length }}/{{ subDepartmentsResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in subDepartmentsResult.results" :key="`sub-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    @click="toggleExpanded('subDepartments', idx)"
                  >
                    <span class="text-sm font-medium truncate">
                      {{ result.success ? '✓ 子部门列表' : `✗ ${result.providerId}` }}
                    </span>
                    <UIcon
                      :name="getExpanded('subDepartments').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400 shrink-0"
                    />
                  </button>
                  <div v-if="getExpanded('subDepartments').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- 获取部门用户 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <UIcon name="i-lucide-users" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取部门用户
              </p>
              <p class="text-xs text-neutral-500">
                获取指定部门的用户列表
              </p>
            </div>
          </div>
          <UInput
            v-model="deptIdInput"
            placeholder="部门ID (默认1)"
            size="sm"
          />
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.deptUsers"
            :disabled="!bindingStatus?.isBound"
            @click="testGetDeptUsers"
          >
            测试
          </UButton>
          <div v-if="deptUsersResult" class="space-y-2">
            <UBadge :color="deptUsersResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ deptUsersResult.results.filter(r => r.success).length }}/{{ deptUsersResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in deptUsersResult.results" :key="`du-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    @click="toggleExpanded('deptUsers', idx)"
                  >
                    <span class="text-sm font-medium truncate">
                      {{ result.success ? `✓ ${result.data?.userIdList?.length || 0} 个用户` : `✗ ${result.providerId}` }}
                    </span>
                    <UIcon
                      :name="getExpanded('deptUsers').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400 shrink-0"
                    />
                  </button>
                  <div v-if="getExpanded('deptUsers').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- 获取用户详细信息 -->
        <div class="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/50">
              <UIcon name="i-lucide-user-circle" class="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                获取用户详情
              </p>
              <p class="text-xs text-neutral-500">
                根据 userId 获取用户详细信息
              </p>
            </div>
          </div>
          <UInput
            v-model="userIdInput"
            placeholder="钉钉 userId (可选)"
            size="sm"
          />
          <UButton
            size="sm"
            variant="soft"
            :loading="loading.userDetails"
            :disabled="!bindingStatus?.isBound"
            @click="testGetUserDetails"
          >
            测试
          </UButton>
          <div v-if="userDetailsResult" class="space-y-2">
            <UBadge :color="userDetailsResult.results.some(r => r.success) ? 'success' : 'error'">
              {{ userDetailsResult.results.filter(r => r.success).length }}/{{ userDetailsResult.accounts }} 成功
            </UBadge>
            <div class="space-y-2">
              <component is="div" v-for="(result, idx) in userDetailsResult.results" :key="`ud-${idx}`">
                <div class="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    class="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    @click="toggleExpanded('userDetails', idx)"
                  >
                    <span class="text-sm font-medium truncate">
                      {{ result.success ? '✓ 用户详情' : `✗ ${result.providerId}` }}
                    </span>
                    <UIcon
                      :name="getExpanded('userDetails').has(idx) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                      class="w-4 h-4 text-neutral-400 shrink-0"
                    />
                  </button>
                  <div v-if="getExpanded('userDetails').has(idx)" class="p-3">
                    <pre class="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg overflow-x-auto">{{ result.error ? `错误: ${result.error}` : formatJson(result.data) }}</pre>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
