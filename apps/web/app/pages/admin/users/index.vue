<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
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
const UIcon = resolveComponent('UIcon')

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
  permissions?: Array<{ id: string, name: string, displayName: string }>
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
const showPermissionsModal = ref(false)
const editingUser = ref<User | null>(null)
const submitting = ref(false)

// Roles & Permissions
const allRoles = ref<any[]>([])
const permissionGroups = ref<any[]>([])
const selectedRoles = ref<string[]>([])
const selectedPermissions = ref<string[]>([])

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

const moduleLabels: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
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
      'size': 'lg',
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': isSelected(row.original),
      'onUpdate:modelValue': () => toggleSelection(row.original),
      'size': 'lg',
    }),
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: '用户',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3 py-2' }, [
      row.original.avatar
        ? h(UAvatar, { src: row.original.avatar, alt: row.original.name, size: 'lg' })
        : h('div', {
            class: 'w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold text-white',
            style: { backgroundColor: getAvatarColor(row.original.email) },
          }, getInitial(row.original.email)),
      h('div', { class: 'flex flex-col gap-0.5' }, [
        row.original.name
          ? h('span', { class: 'text-base font-medium text-neutral-900 dark:text-white' }, row.original.name)
          : h('span', { class: 'text-base font-medium text-neutral-900 dark:text-white' }, row.original.email),
        h('span', { class: 'text-sm text-neutral-500 dark:text-neutral-400' }, row.original.email),
      ]),
    ]),
  },
  {
    accessorKey: 'roles',
    header: '角色',
    cell: ({ row }) => {
      const roles = row.original.roles
      if (!roles || roles.length === 0) {
        return h('span', { class: 'text-base text-neutral-400' }, '-')
      }
      return h('div', { class: 'flex flex-wrap gap-1.5' }, [
        h(UBadge, { color: 'primary', variant: 'subtle', size: 'md' }, () => roles[0]?.displayName || roles[0]?.name),
        roles.length > 1
          ? h(UBadge, { color: 'neutral', variant: 'soft', size: 'md' }, () => `+${roles.length - 1}`)
          : null,
      ])
    },
  },
  {
    accessorKey: 'permissions',
    header: '直接权限',
    cell: ({ row }) => {
      const permissions = row.original.permissions || []
      if (!permissions || permissions.length === 0) {
        return h('span', { class: 'text-base text-neutral-400' }, '-')
      }
      return h('div', { class: 'flex flex-wrap gap-1.5' }, [
        h(UBadge, { color: 'success', variant: 'subtle', size: 'md' }, () => permissions[0]?.displayName || permissions[0]?.name),
        permissions.length > 1
          ? h(UBadge, { color: 'neutral', variant: 'soft', size: 'md' }, () => `+${permissions.length - 1}`)
          : null,
      ])
    },
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => h(UBadge, {
      color: statusColors[row.original.status],
      variant: 'subtle',
      size: 'md',
    }, () => statusLabels[row.original.status]),
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => h('span', { class: 'text-base text-neutral-500 dark:text-neutral-400' }, formatDate(row.original.createdAt)),
  },
  {
    id: 'actions',
    header: '操作',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => {
      const items = [
        [{ label: '分配角色', icon: 'i-lucide-shield', onSelect: () => openRolesModal(row.original) }],
        [{ label: '分配权限', icon: 'i-lucide-key', onSelect: () => openPermissionsModal(row.original) }],
        [{ label: row.original.status === 'ACTIVE' ? '禁用' : '启用', icon: row.original.status === 'ACTIVE' ? 'i-lucide-ban' : 'i-lucide-check', onSelect: () => toggleUserStatus(row.original) }],
        [{ label: '删除', icon: 'i-lucide-trash', onSelect: () => deleteItem(row.original.id) }],
      ]
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UButton, { variant: 'soft', color: 'neutral', size: 'sm', icon: 'i-lucide-edit', onClick: () => openEditModal(row.original) }, () => '编辑'),
        h(UDropdownMenu, { items, content: { align: 'end' } }, () =>
          h(UButton, { icon: 'i-lucide-more-horizontal', variant: 'ghost', color: 'neutral', size: 'sm' })),
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

async function fetchPermissions() {
  try {
    permissionGroups.value = await api.get('/permissions/modules')
  }
  catch (error) {
    console.error('Failed to fetch permissions', error)
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

function openPermissionsModal(user: User) {
  editingUser.value = user
  selectedPermissions.value = user.permissions?.map(p => p.id) || []
  showPermissionsModal.value = true
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

function togglePermission(permId: string) {
  const index = selectedPermissions.value.indexOf(permId)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  }
  else {
    selectedPermissions.value.push(permId)
  }
}

function toggleGroupPermissions(group: any) {
  const groupIds = group.permissions.map((p: any) => p.id)
  const allSelected = groupIds.every((id: string) => selectedPermissions.value.includes(id))
  if (allSelected) {
    selectedPermissions.value = selectedPermissions.value.filter((id: string) => !groupIds.includes(id))
  }
  else {
    groupIds.forEach((id: string) => {
      if (!selectedPermissions.value.includes(id)) {
        selectedPermissions.value.push(id)
      }
    })
  }
}

function isGroupAllSelected(group: any) {
  return group.permissions.every((p: any) => selectedPermissions.value.includes(p.id))
}

function isGroupPartiallySelected(group: any) {
  const selectedCount = group.permissions.filter((p: any) => selectedPermissions.value.includes(p.id)).length
  return selectedCount > 0 && selectedCount < group.permissions.length
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

async function savePermissions() {
  if (!editingUser.value)
    return
  submitting.value = true
  try {
    await api.patch(`/users/${editingUser.value.id}/permissions`, { permissionIds: selectedPermissions.value })
    toast.add({ title: '保存成功', color: 'success' })
    showPermissionsModal.value = false
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
  showRolesModal.value = true
  editingUser.value = null
  selectedRoles.value = []
}

async function handleBatchAssignPermissions() {
  if (selectedItems.value.length === 0) {
    toast.add({ title: '请先选择用户', color: 'warning' })
    return
  }
  showPermissionsModal.value = true
  editingUser.value = null
  selectedPermissions.value = []
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

async function saveBatchPermissions() {
  if (selectedItems.value.length === 0)
    return
  submitting.value = true
  try {
    await api.patch('/users/batch/permissions', {
      userIds: selectedItems.value.map(u => u.id),
      permissionIds: selectedPermissions.value,
    })
    toast.add({ title: '批量分配成功', color: 'success' })
    showPermissionsModal.value = false
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
  fetchPermissions()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          用户管理
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400">
          管理系统用户账户、角色和权限
        </p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" @click="openCreateModal">
        创建用户
      </UButton>
    </div>

    <UCard>
      <!-- Toolbar -->
      <template #header>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <UInput
              v-model="filters.search"
              placeholder="搜索用户邮箱或姓名..."
              icon="i-lucide-search"
              size="lg"
              @input="debouncedSearch"
            />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <UButton variant="outline" color="neutral" size="lg" icon="i-lucide-refresh-cw" @click="fetchItems" />
            <UButton
              v-if="selectedItems.length > 0"
              variant="outline"
              color="error"
              size="lg"
              icon="i-lucide-trash"
              @click="batchDelete"
            >
              删除
            </UButton>
            <UButton
              v-if="selectedItems.length > 0"
              variant="outline"
              color="neutral"
              size="lg"
              icon="i-lucide-shield"
              @click="handleBatchAssignRoles"
            >
              分配角色
            </UButton>
            <UButton
              v-if="selectedItems.length > 0"
              variant="outline"
              color="primary"
              size="lg"
              icon="i-lucide-key"
              @click="handleBatchAssignPermissions"
            >
              分配权限
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
          <div class="flex flex-col items-center justify-center py-16">
            <UIcon name="i-lucide-users" class="w-16 h-16 text-neutral-300 dark:text-neutral-600" />
            <p class="mt-4 text-base font-medium text-neutral-500">
              暂无用户数据
            </p>
            <p class="mt-1 text-sm text-neutral-400">
              点击上方"创建用户"按钮添加第一个用户
            </p>
          </div>
        </template>
      </UTable>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-base text-neutral-500 dark:text-neutral-400">
              显示 {{ pagination.startIndex.value }} 至 {{ pagination.endIndex.value }} 共 {{ pagination.total.value }} 条
            </span>
            <div class="flex items-center gap-2">
              <span class="text-base text-neutral-500 dark:text-neutral-400">每页:</span>
              <USelectMenu
                :model-value="pagination.pageSize.value"
                :options="pagination.pageSizeOptions"
                size="lg"
                class="w-20"
                @update:model-value="handlePageSizeChange"
              />
            </div>
          </div>
          <UPagination
            :model-value="pagination.page.value"
            :total="pagination.total.value"
            :page-count="pagination.pageSize.value"
            size="lg"
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
              <h3 class="text-lg font-semibold">
                {{ editingUser ? '编辑用户' : '创建用户' }}
              </h3>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showModal = false" />
            </div>
          </template>

          <UForm :state="form" :schema="formSchema" class="space-y-5" @submit="onSubmit">
            <UFormField name="name" label="姓名">
              <UInput v-model="form.name" placeholder="请输入姓名" size="lg" />
            </UFormField>

            <UFormField name="email" label="邮箱">
              <UInput v-model="form.email" type="email" placeholder="请输入邮箱" :disabled="!!editingUser" size="lg" />
            </UFormField>

            <UFormField v-if="!editingUser" name="password" label="密码">
              <UInput v-model="form.password" type="password" placeholder="请输入密码（至少8个字符）" size="lg" />
            </UFormField>

            <div class="flex gap-3 justify-end pt-5 border-t border-neutral-200 dark:border-neutral-800">
              <UButton variant="outline" color="neutral" size="lg" @click="showModal = false">
                取消
              </UButton>
              <UButton type="submit" :loading="submitting" size="lg">
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
              <h3 class="text-lg font-semibold">
                {{ editingUser ? `分配角色 - ${editingUser.name}` : `批量分配角色 (${selectedItems.length}个用户)` }}
              </h3>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showRolesModal = false" />
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="role in allRoles"
              :key="role.id"
              class="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
              @click="toggleRole(role.id)"
            >
              <UCheckbox
                :model-value="selectedRoles.includes(role.id)"
                size="lg"
                @update:model-value="toggleRole(role.id)"
              />
              <div class="flex-1">
                <p class="font-medium text-base">
                  {{ role.displayName }}
                </p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">
                  {{ role.description || role.name }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-5 pt-5 border-t border-neutral-200 dark:border-neutral-800">
            <UButton variant="outline" color="neutral" size="lg" @click="showRolesModal = false">
              取消
            </UButton>
            <UButton :loading="submitting" size="lg" @click="editingUser ? saveRoles() : saveBatchRoles()">
              保存
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Permissions Modal -->
    <UModal v-model:open="showPermissionsModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ editingUser ? `分配权限 - ${editingUser.name}` : `批量分配权限 (${selectedItems.length}个用户)` }}
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  已选择 {{ selectedPermissions.length }} 个权限
                </p>
              </div>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showPermissionsModal = false" />
            </div>
          </template>

          <div class="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
            <div v-for="group in permissionGroups" :key="group.module" class="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <UCheckbox
                    :model-value="isGroupAllSelected(group)"
                    :indeterminate="isGroupPartiallySelected(group)"
                    size="lg"
                    @update:model-value="toggleGroupPermissions(group)"
                  />
                  <h4 class="text-base font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                    {{ moduleLabels[group.module] || group.module }}
                  </h4>
                  <span class="text-xs text-neutral-500">
                    ({{ group.permissions.filter((p: any) => selectedPermissions.includes(p.id)).length }}/{{ group.permissions.length }})
                  </span>
                </div>
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="toggleGroupPermissions(group)"
                >
                  {{ isGroupAllSelected(group) ? '取消' : '全选' }}
                </UButton>
              </div>
              <div class="space-y-2 pl-9">
                <div
                  v-for="perm in group.permissions"
                  :key="perm.id"
                  class="flex items-center gap-3 p-2.5 rounded-md hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  @click="togglePermission(perm.id)"
                >
                  <UCheckbox
                    :model-value="selectedPermissions.includes(perm.id)"
                    size="md"
                    @update:model-value="togglePermission(perm.id)"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium">
                      {{ perm.displayName }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ perm.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-5 mt-5 border-t border-neutral-200 dark:border-neutral-800">
            <UButton variant="outline" color="neutral" size="lg" @click="showPermissionsModal = false">
              取消
            </UButton>
            <UButton :loading="submitting" size="lg" @click="editingUser ? savePermissions() : saveBatchPermissions()">
              保存 ({{ selectedPermissions.length }})
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Ensure table cells have proper height */
:deep(td),
:deep(th) {
  vertical-align: middle;
}

/* Custom scrollbar for permissions modal */
:deep(.max-h-\\[60vh\\]) {
  scrollbar-width: thin;
  scrollbar-color: rgb(229 231 235) transparent;
}

:deep(.max-h-\\[60vh\\])::-webkit-scrollbar {
  width: 6px;
}

:deep(.max-h-\\[60vh\\])::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.max-h-\\[60vh\\])::-webkit-scrollbar-thumb {
  background-color: rgb(229 231 235);
  border-radius: 3px;
}

.dark :deep(.max-h-\\[60vh\\])::-webkit-scrollbar-thumb {
  background-color: rgb(55 65 81);
}
</style>
