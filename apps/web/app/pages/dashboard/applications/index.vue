<script setup lang="ts">
import type { Application } from '~/composables/useApplication'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const { getMyApplications, deleteApplication } = useApplication()
const toast = useToast()
const router = useRouter()

const loading = ref(true)
const isFirstLoad = ref(true)
const error = ref<string | null>(null)
const applications = ref<Application[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

// 删除确认
const deleteModal = ref(false)
const deletingApp = ref<Application | null>(null)

// 新建/编辑弹窗
const showFormModal = ref(false)
const editingApp = ref<Application | null>(null)

// 加载应用列表
async function loadApplications() {
  loading.value = true
  error.value = null
  try {
    const result = await getMyApplications({
      page: pagination.page,
      limit: pagination.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    applications.value = result.data
    pagination.total = result.meta.total
    pagination.totalPages = result.meta.totalPages
  }
  catch (e: any) {
    console.error('Failed to load applications:', e)
    const message = e.response?._data?.message || e.message || '加载失败'
    error.value = message
    toast.add({ title: message, color: 'error' })
  }
  finally {
    loading.value = false
    isFirstLoad.value = false
  }
}

onMounted(() => {
  loadApplications()
})

// 打开新建弹窗
function handleCreate() {
  editingApp.value = null
  showFormModal.value = true
}

// 打开编辑弹窗
function handleEdit(app: Application) {
  editingApp.value = app
  showFormModal.value = true
}

// 表单提交成功
function handleFormSuccess() {
  loadApplications()
}

// 查看详情
function handleView(app: Application) {
  router.push(`/dashboard/applications/${app.id}`)
}

// 删除应用
function handleDelete(app: Application) {
  deletingApp.value = app
  deleteModal.value = true
}

async function confirmDelete() {
  if (!deletingApp.value)
    return

  try {
    await deleteApplication(deletingApp.value.id)
    toast.add({ title: '应用已删除' })
    deleteModal.value = false
    deletingApp.value = null
    await loadApplications()
  }
  catch (e: any) {
    console.error('Failed to delete application:', e)
    const message = e.response?._data?.message || e.message || '删除失败'
    toast.add({ title: message, color: 'error' })
  }
}

// 复制 Client ID
async function copyClientId(clientId: string) {
  try {
    await navigator.clipboard.writeText(clientId)
    toast.add({ title: '已复制到剪贴板' })
  }
  catch {
    toast.add({ title: '复制失败', color: 'error' })
  }
}

// 分页
function onPageChange(page: number) {
  pagination.page = page
  loadApplications()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
          我的应用
        </h1>
        <p class="text-neutral-600 dark:text-neutral-400">
          管理 OAuth 应用，让其他应用可以使用 Zeta 账号登录
        </p>
      </div>
      <UButton color="primary" variant="solid" @click="handleCreate">
        <template #leading>
          <UIcon name="i-lucide-plus" />
        </template>
        创建应用
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isFirstLoad && loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error && isFirstLoad && applications.length === 0" class="flex flex-col items-center rounded-xl border border-dashed border-red-300 py-12 dark:border-red-700">
      <UIcon name="i-lucide-alert-circle" class="mb-4 h-16 w-16 text-red-400" />
      <h3 class="mb-2 text-lg font-medium text-neutral-900 dark:text-white">
        加载失败
      </h3>
      <p class="mb-6 text-center text-neutral-600 dark:text-neutral-400">
        {{ error }}
      </p>
      <UButton color="primary" variant="soft" @click="loadApplications">
        重试
      </UButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && applications.length === 0" class="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 py-12 dark:border-neutral-700">
      <UIcon name="i-lucide-layout-grid" class="mb-4 h-16 w-16 text-neutral-400" />
      <h3 class="mb-2 text-lg font-medium text-neutral-900 dark:text-white">
        还没有应用
      </h3>
      <p class="mb-6 text-center text-neutral-600 dark:text-neutral-400">
        创建一个 OAuth 应用，让其他应用可以使用 Zeta 账号登录
      </p>
      <UButton color="primary" variant="soft" @click="handleCreate">
        创建第一个应用
      </UButton>
    </div>

    <!-- Application List -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="app in applications"
        :key="app.id"
        class="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-700"
      >
        <!-- Status Badge -->
        <div class="absolute right-4 top-4">
          <UBadge
            :color="app.isActive ? 'success' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ app.isActive ? '启用' : '禁用' }}
          </UBadge>
        </div>

        <!-- App Icon -->
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400">
          <img
            v-if="app.logo"
            :src="app.logo"
            :alt="app.name"
            class="h-8 w-8 rounded-lg object-cover"
          >
          <UIcon v-else name="i-lucide-layout-grid" class="h-6 w-6 text-white" />
        </div>

        <!-- App Info -->
        <div class="mb-4">
          <h3 class="mb-1 font-semibold text-neutral-900 dark:text-white">
            {{ app.name }}
          </h3>
          <p v-if="app.description" class="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ app.description }}
          </p>
        </div>

        <!-- Client ID -->
        <div class="mb-4 rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
          <div class="mb-1 text-xs text-neutral-500">
            Client ID
          </div>
          <div class="flex items-center justify-between gap-2">
            <code class="text-xs text-neutral-700 dark:text-neutral-300">{{ app.clientId }}</code>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyClientId(app.clientId)"
            />
          </div>
        </div>

        <!-- Stats -->
        <div class="mb-4 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-users" class="h-4 w-4" />
            <span>{{ app._count?.userGrants || 0 }} 授权用户</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            class="flex-1"
            @click="handleView(app)"
          >
            详情
          </UButton>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-more-horizontal"
            :pop="{ portal: true }"
          >
            <UDropdownMenu
              :items="[
                [
                  {
                    label: '编辑',
                    icon: 'i-lucide-edit',
                    click: () => handleEdit(app),
                  },
                  {
                    label: '删除',
                    icon: 'i-lucide-trash-2',
                    click: () => handleDelete(app),
                  },
                ],
              ]"
            />
          </UButton>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <UPagination
        :model-value="pagination.page"
        :total="pagination.total"
        :per-page="pagination.limit"
        @update:model-value="onPageChange"
      />
    </div>

    <!-- Create/Edit Modal -->
    <ApplicationFormModal
      v-model:open="showFormModal"
      :application="editingApp"
      @success="handleFormSuccess"
    />

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-amber-600" />
              <span class="font-medium">确认删除</span>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-neutral-700 dark:text-neutral-300">
              确定要删除应用 <span class="font-medium text-neutral-900 dark:text-white">{{ deletingApp?.name }}</span> 吗？
            </p>
            <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <UIcon name="i-lucide-alert-circle" class="mr-1 inline-block h-4 w-4 align-middle" />
              删除后，该应用的所有授权将被撤销，已颁发的 token 将失效。此操作不可撤销。
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="deleteModal = false">
                取消
              </UButton>
              <UButton color="error" variant="solid" @click="confirmDelete">
                确认删除
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
