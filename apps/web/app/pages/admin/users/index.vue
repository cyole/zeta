<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({
  layout: 'dashboard',
  middleware: 'admin',
})

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useApi()
const toast = useToast()

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  emailVerified: boolean
  createdAt: string
  roles: Array<{ id: string, name: string, displayName: string }>
}

// CRUD Table composable
const {
  loading,
  items: users,
  selectedItems,
  filters,
  pagination,
  fetchItems,
  deleteItem,
  batchDelete,
  toggleSelection,
  toggleSelectAll,
  isSelected,
  isAllSelected,
  isSomeSelected,
  debouncedSearch,
} = useCrudTable<User>({
  endpoint: '/users',
  initialFilters: { search: '' },
})

// Modals
const showModal = ref(false)
const showRolesModal = ref(false)
const editingUser = ref<User | null>(null)
const submitting = ref(false)

// Roles
const allRoles = ref<any[]>([])
const selectedRoles = ref<string[]>([])

// Form
const formSchema = computed(() => {
  const base = {
    name: z.string().min(1, '请输入姓名'),
    email: z.string().email('请输入有效的邮箱'),
  }
  if (!editingUser.value) {
    return z.object({
      ...base,
      password: z.string().min(8, '密码至少8个字符'),
    })
  }
  return z.object(base)
})

const form = reactive({
  name: '',
  email: '',
  password: '',
})

// Constants
const statusLabels: Record<string, string> = {
  ACTIVE: '启用',
  INACTIVE: '未激活',
  SUSPENDED: '已禁用',
}

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'error',
}

// Helper functions
function getAvatarColor(email: string) {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6']
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function getInitial(email: string) {
  return email.charAt(0).toUpperCase()
}

function formatDate(dateString: string) {
  if (!dateString)
    return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// Table columns
const columns: TableColumn<User>[] = [
  {
    id: 'select',
    header: () => h(UCheckbox, {
      'modelValue': isAllSelected.value ? true : isSomeSelected.value ? 'indeterminate' : false,
      'onUpdate:modelValue': () => toggleSelectAll(),
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': isSelected(row.original),
      'onUpdate:modelValue': () => toggleSelection(row.original),
    }),
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: '用户',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      row.original.avatar
        ? h(UAvatar, { src: row.original.avatar, alt: row.original.name, size: 'sm' })
        : h('div', {
            class: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white',
            style: { backgroundColor: getAvatarColor(row.original.email) },
          }, getInitial(row.original.email)),
      h('span', { class: 'text-sm' }, row.original.email),
    ]),
  },
  {
    accessorKey: 'name',
    header: '用户名',
    cell: ({ row }) => row.original.name || '-',
  },
  {
    accessorKey: 'roles',
    header: '角色',
    cell: ({ row }) => {
      const roles = row.original.roles
      if (!roles || roles.length === 0) {
        return h(UBadge, { color: 'neutral', variant: 'subtle', size: 'xs' }, () => '用户')
      }
      return h(UBadge, { color: 'primary', variant: 'subtle', size: 'xs' }, () => roles[0]?.displayName || roles[0]?.name)
    },
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => h(UBadge, {
      color: statusColors[row.original.status],
      variant: 'subtle',
      size: 'xs',
    }, () => statusLabels[row.original.status]),
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => h('span', { class: 'text-sm text-neutral-500' }, formatDate(row.original.createdAt)),
  },
  {
    id: 'actions',
    header: '操作',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => {
      const items = [
        [{ label: '分配角色', icon: 'i-lucide-shield', onSelect: () => openRolesModal(row.original) }],
        [{ label: row.original.status === 'ACTIVE' ? '禁用' : '启用', icon: row.original.status === 'ACTIVE' ? 'i-lucide-ban' : 'i-lucide-check', onSelect: () => toggleUserStatus(row.original) }],
        [{ label: '删除', icon: 'i-lucide-trash', onSelect: () => deleteItem(row.original.id) }],
      ]
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(UButton, { variant: 'ghost', color: 'neutral', size: 'xs', onClick: () => openEditModal(row.original) }, () => [
          h('span', { class: 'i-lucide-edit w-4 h-4 mr-1' }),
          '编辑',
        ]),
        h(UDropdownMenu, { items, content: { align: 'end' } }, () =>
          h(UButton, { variant: 'ghost', color: 'neutral', size: 'xs' }, () => [
            h('span', { class: 'i-lucide-more-horizontal w-4 h-4' }),
          ]),
        ),
      ])
    },
  },
]

// Methods
async function fetchRoles() {
  try {
    allRoles.value = await api.get('/roles')
  }
  catch (error) {
    console.error('Failed to fetch roles', error)
  }
}

function openCreateModal() {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  form.name = user.name
  form.email = user.email
  form.password = ''
  showModal.value = true
}

function openRolesModal(user: User) {
  editingUser.value = user
  selectedRoles.value = user.roles?.map(r => r.id) || []
  showRolesModal.value = true
}

function toggleRole(roleId: string) {
  const index = selectedRoles.value.indexOf(roleId)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  }
  else {
    selectedRoles.value.push(roleId)
  }
}

async function onSubmit() {
  submitting.value = true
  try {
    if (editingUser.value) {
      await api.patch(`/users/${editingUser.value.id}`, { name: form.name })
    }
    else {
      await api.post('/users', form)
    }
    toast.add({ title: '保存成功', color: 'success' })
    showModal.value = false
    fetchItems()
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function saveRoles() {
  if (!editingUser.value)
    return
  submitting.value = true
  try {
    await api.patch(`/users/${editingUser.value.id}/roles`, { roleIds: selectedRoles.value })
    toast.add({ title: '保存成功', color: 'success' })
    showRolesModal.value = false
    fetchItems()
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function toggleUserStatus(user: User) {
  const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  try {
    await api.patch(`/users/${user.id}`, { status: newStatus })
    toast.add({ title: newStatus === 'ACTIVE' ? '已启用' : '已禁用', color: 'success' })
    fetchItems()
  }
  catch (error: any) {
    toast.add({ title: '操作失败', description: error.message, color: 'error' })
  }
}

async function handleBatchAssignRoles() {
  if (selectedItems.value.length === 0) {
    toast.add({ title: '请先选择用户', color: 'warning' })
    return
  }
  // Open a modal for batch role assignment
  showRolesModal.value = true
  editingUser.value = null
  selectedRoles.value = []
}

async function saveBatchRoles() {
  if (selectedItems.value.length === 0)
    return
  submitting.value = true
  try {
    await api.patch('/users/batch/roles', {
      userIds: selectedItems.value.map(u => u.id),
      roleIds: selectedRoles.value,
    })
    toast.add({ title: '批量分配成功', color: 'success' })
    showRolesModal.value = false
    selectedItems.value = []
    fetchItems()
  }
  catch (error: any) {
    toast.add({ title: '批量分配失败', description: error.message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

function handlePageSizeChange(value: unknown) {
  if (typeof value === 'number') {
    pagination.setPageSize(value)
  }
}

// Init
onMounted(() => {
  fetchItems()
  fetchRoles()
})
</script>

<template>
  <div>
    <UCard class="overflow-hidden">
      <!-- Header -->
      <template #header>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="w-full sm:w-80">
            <UInput
              v-model="filters.search"
              placeholder="搜索用户..."
              icon="i-lucide-search"
              @input="debouncedSearch"
            />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <UButton variant="outline" color="neutral" size="sm" @click="fetchItems">
              <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
            </UButton>
            <UButton
              v-if="selectedItems.length > 0"
              variant="outline"
              color="error"
              size="sm"
              @click="batchDelete"
            >
              <UIcon name="i-lucide-trash" class="w-4 h-4 mr-1" />
              删除 ({{ selectedItems.length }})
            </UButton>
            <UButton
              v-if="selectedItems.length > 0"
              variant="outline"
              color="neutral"
              size="sm"
              @click="handleBatchAssignRoles"
            >
              <UIcon name="i-lucide-shield" class="w-4 h-4 mr-1" />
              分配角色
            </UButton>
            <UButton size="sm" @click="openCreateModal">
              <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
              创建用户
            </UButton>
          </div>
        </div>
      </template>

      <!-- Table -->
      <UTable
        :data="users"
        :columns="columns"
        :loading="loading"
        class="min-h-[400px]"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-lucide-users" class="w-12 h-12 text-neutral-300" />
            <p class="mt-2 text-sm text-neutral-500">
              暂无用户数据
            </p>
          </div>
        </template>
      </UTable>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-neutral-500">
              显示 {{ pagination.startIndex.value }} 至 {{ pagination.endIndex.value }} 共 {{ pagination.total.value }} 条
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-neutral-500">每页:</span>
              <USelectMenu
                :model-value="pagination.pageSize.value"
                :options="pagination.pageSizeOptions"
                size="xs"
                class="w-20"
                @update:model-value="handlePageSizeChange"
              />
            </div>
          </div>
          <UPagination
            :model-value="pagination.page.value"
            :total="pagination.total.value"
            :page-count="pagination.pageSize.value"
            @update:model-value="pagination.setPage"
          />
        </div>
      </template>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">
                {{ editingUser ? '编辑用户' : '创建用户' }}
              </h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="showModal = false">
                <UIcon name="i-lucide-x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <UForm :state="form" :schema="formSchema" class="space-y-4" @submit="onSubmit">
            <UFormField name="name" label="姓名">
              <UInput v-model="form.name" placeholder="请输入姓名" />
            </UFormField>

            <UFormField name="email" label="邮箱">
              <UInput v-model="form.email" type="email" placeholder="请输入邮箱" :disabled="!!editingUser" />
            </UFormField>

            <UFormField v-if="!editingUser" name="password" label="密码">
              <UInput v-model="form.password" type="password" placeholder="请输入密码" />
            </UFormField>

            <div class="flex gap-2 justify-end pt-4 border-t">
              <UButton variant="outline" color="neutral" @click="showModal = false">
                取消
              </UButton>
              <UButton type="submit" :loading="submitting">
                {{ editingUser ? '保存' : '创建' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <!-- Roles Modal -->
    <UModal v-model:open="showRolesModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">
                {{ editingUser ? `分配角色 - ${editingUser.name}` : `批量分配角色 (${selectedItems.length}个用户)` }}
              </h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="showRolesModal = false">
                <UIcon name="i-lucide-x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="role in allRoles"
              :key="role.id"
              class="flex items-center gap-3 p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
              @click="toggleRole(role.id)"
            >
              <UCheckbox
                :model-value="selectedRoles.includes(role.id)"
                @update:model-value="toggleRole(role.id)"
              />
              <div class="flex-1">
                <p class="font-medium">
                  {{ role.displayName }}
                </p>
                <p class="text-sm text-neutral-500">
                  {{ role.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-4 pt-4 border-t">
            <UButton variant="outline" color="neutral" @click="showRolesModal = false">
              取消
            </UButton>
            <UButton :loading="submitting" @click="editingUser ? saveRoles() : saveBatchRoles()">
              保存
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
