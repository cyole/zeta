<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'dashboard',
  middleware: 'admin',
})

const api = useApi()
const toast = useToast()

// State
const roles = ref<any[]>([])
const permissionGroups = ref<any[]>([])
const showModal = ref(false)
const showPermissionsModal = ref(false)
const editingRole = ref<any>(null)
const submitting = ref(false)
const selectedPermissions = ref<string[]>([])

const moduleLabels: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
}

// Form
const formSchema = z.object({
  name: z.string().min(1, '请输入角色标识').regex(/^[A-Z_]+$/, '只能包含大写字母和下划线'),
  displayName: z.string().min(1, '请输入显示名称'),
  description: z.string().optional(),
})

const form = reactive({
  name: '',
  displayName: '',
  description: '',
})

// Methods
async function fetchRoles() {
  try {
    roles.value = await api.get('/roles')
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
  editingRole.value = null
  form.name = ''
  form.displayName = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(role: any) {
  editingRole.value = role
  form.name = role.name
  form.displayName = role.displayName
  form.description = role.description || ''
  showModal.value = true
}

function openPermissionsModal(role: any) {
  editingRole.value = role
  selectedPermissions.value = role.permissions?.map((p: any) => p.id) || []
  showPermissionsModal.value = true
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

async function onSubmit() {
  submitting.value = true
  try {
    if (editingRole.value) {
      await api.patch(`/roles/${editingRole.value.id}`, {
        displayName: form.displayName,
        description: form.description,
      })
    }
    else {
      await api.post('/roles', form)
    }
    toast.add({ title: '保存成功', color: 'success' })
    showModal.value = false
    fetchRoles()
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function savePermissions() {
  submitting.value = true
  try {
    await api.patch(`/roles/${editingRole.value.id}/permissions`, {
      permissionIds: selectedPermissions.value,
    })
    toast.add({ title: '保存成功', color: 'success' })
    showPermissionsModal.value = false
    fetchRoles()
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

async function deleteRole(role: any) {
  // eslint-disable-next-line no-alert
  if (!confirm(`确定要删除角色 "${role.displayName}" 吗？`))
    return

  try {
    await api.del(`/roles/${role.id}`)
    toast.add({ title: '删除成功', color: 'success' })
    fetchRoles()
  }
  catch (error: any) {
    toast.add({ title: '删除失败', description: error.message, color: 'error' })
  }
}

// Init
onMounted(() => {
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
          角色管理
        </h1>
        <p class="text-neutral-500">
          管理系统角色和分配权限
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreateModal">
        创建角色
      </UButton>
    </div>

    <!-- Roles grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="role in roles" :key="role.id" class="relative">
        <!-- System badge -->
        <UBadge
          v-if="role.isSystem"
          color="neutral"
          variant="subtle"
          class="absolute top-4 right-4"
          size="xs"
        >
          系统
        </UBadge>

        <div class="space-y-4">
          <!-- Role info -->
          <div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
              {{ role.displayName }}
            </h3>
            <p class="text-sm text-neutral-500">
              {{ role.name }}
            </p>
            <p v-if="role.description" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {{ role.description }}
            </p>
          </div>

          <!-- Stats -->
          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-1.5 text-neutral-500">
              <UIcon name="i-lucide-users" class="w-4 h-4" />
              <span>{{ role.userCount || 0 }} 用户</span>
            </div>
            <div class="flex items-center gap-1.5 text-neutral-500">
              <UIcon name="i-lucide-key" class="w-4 h-4" />
              <span>{{ role.permissions?.length || 0 }} 权限</span>
            </div>
          </div>

          <!-- Permissions preview -->
          <div v-if="role.permissions?.length" class="flex flex-wrap gap-1">
            <UBadge
              v-for="perm in role.permissions.slice(0, 3)"
              :key="perm.name"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              {{ perm.displayName }}
            </UBadge>
            <UBadge
              v-if="role.permissions.length > 3"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              +{{ role.permissions.length - 3 }}
            </UBadge>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UButton
              variant="outline"
              size="xs"
              icon="i-lucide-key"
              @click="openPermissionsModal(role)"
            >
              权限
            </UButton>
            <UButton
              v-if="!role.isSystem"
              variant="outline"
              size="xs"
              icon="i-lucide-edit"
              @click="openEditModal(role)"
            >
              编辑
            </UButton>
            <UButton
              v-if="!role.isSystem && !role.userCount"
              variant="outline"
              size="xs"
              color="error"
              icon="i-lucide-trash"
              @click="deleteRole(role)"
            >
              删除
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create/Edit modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              {{ editingRole ? '编辑角色' : '创建角色' }}
            </h3>
          </template>

          <UForm :state="form" :schema="formSchema" class="space-y-4" @submit="onSubmit">
            <UFormField name="name" label="角色标识">
              <UInput
                v-model="form.name"
                placeholder="如: DEVELOPER"
                :disabled="!!editingRole"
              />
            </UFormField>

            <UFormField name="displayName" label="显示名称">
              <UInput v-model="form.displayName" placeholder="如: 开发人员" />
            </UFormField>

            <UFormField name="description" label="描述">
              <UTextarea v-model="form.description" placeholder="角色描述（可选）" />
            </UFormField>

            <div class="flex gap-2 justify-end">
              <UButton variant="outline" @click="showModal = false">
                取消
              </UButton>
              <UButton type="submit" :loading="submitting">
                {{ editingRole ? '保存' : '创建' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <!-- Permissions modal -->
    <UModal v-model:open="showPermissionsModal">
      <template #content>
        <UCard class="max-h-[80vh] overflow-auto">
          <template #header>
            <h3 class="font-semibold">
              分配权限 - {{ editingRole?.displayName }}
            </h3>
          </template>

          <div class="space-y-6">
            <div v-for="group in permissionGroups" :key="group.module">
              <h4 class="font-medium mb-3 capitalize">
                {{ moduleLabels[group.module] || group.module }}
              </h4>
              <div class="space-y-2">
                <div
                  v-for="perm in group.permissions"
                  :key="perm.id"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <UCheckbox
                    :model-value="selectedPermissions.includes(perm.id)"
                    :disabled="editingRole?.isSystem && editingRole?.name === 'SUPER_ADMIN'"
                    @update:model-value="togglePermission(perm.id)"
                  />
                  <div>
                    <p class="font-medium text-sm">
                      {{ perm.displayName }}
                    </p>
                    <p class="text-xs text-neutral-500">
                      {{ perm.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UButton variant="outline" @click="showPermissionsModal = false">
              取消
            </UButton>
            <UButton
              :loading="submitting"
              :disabled="editingRole?.isSystem && editingRole?.name === 'SUPER_ADMIN'"
              @click="savePermissions"
            >
              保存
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
