<template>
  <div>
    <!-- Main card container -->
    <UCard class="overflow-hidden">
      <!-- Card header with search and actions -->
      <template #header>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <!-- Search -->
          <div class="w-full sm:w-80">
            <UInput
              v-model="search"
              placeholder="搜索用户..."
              icon="i-lucide-search"
              @input="debouncedSearch"
            />
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <UButton variant="outline" color="neutral" size="sm" @click="refreshData">
              <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
            </UButton>
            <UButton variant="outline" color="neutral" size="sm">
              <UIcon name="i-lucide-filter" class="w-4 h-4 mr-1" />
              筛选设置
            </UButton>
            <UButton variant="outline" color="neutral" size="sm">
              <UIcon name="i-lucide-columns" class="w-4 h-4 mr-1" />
              列设置
            </UButton>
            <UButton variant="outline" color="neutral" size="sm">
              <UIcon name="i-lucide-settings" class="w-4 h-4 mr-1" />
              属性配置
            </UButton>
            <UButton @click="openCreateModal" size="sm">
              <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
              创建用户
            </UButton>
          </div>
        </div>
      </template>

      <!-- Users table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  用户
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  ID
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  用户名
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  角色
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  余额
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  状态
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  创建时间
                  <UIcon name="i-lucide-chevrons-up-down" class="w-4 h-4" />
                </div>
              </th>
              <th class="text-right py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading state -->
            <tr v-if="loading">
              <td colspan="8" class="py-12 text-center">
                <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-teal-500 mx-auto" />
                <p class="mt-2 text-sm text-slate-500">加载中...</p>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-else-if="users.length === 0">
              <td colspan="8" class="py-12 text-center">
                <UIcon name="i-lucide-users" class="w-12 h-12 text-slate-300 mx-auto" />
                <p class="mt-2 text-sm text-slate-500">暂无用户数据</p>
              </td>
            </tr>

            <!-- User rows -->
            <tr
              v-else
              v-for="user in users"
              :key="user.id"
              class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <!-- User (avatar + email) -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    :style="{ backgroundColor: getAvatarColor(user.email) }"
                  >
                    {{ getInitial(user.email) }}
                  </div>
                  <span class="text-sm text-slate-700 dark:text-slate-200">{{ user.email }}</span>
                </div>
              </td>

              <!-- ID -->
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                {{ user.id?.slice(0, 8) || '-' }}
              </td>

              <!-- Username -->
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                {{ user.name || '-' }}
              </td>

              <!-- Role -->
              <td class="py-3 px-4">
                <UBadge
                  v-if="user.roles && user.roles.length > 0"
                  :color="getRoleBadgeColor(user.roles[0]?.name)"
                  variant="subtle"
                  size="xs"
                >
                  {{ user.roles[0]?.displayName || '用户' }}
                </UBadge>
                <UBadge v-else color="neutral" variant="subtle" size="xs">用户</UBadge>
              </td>

              <!-- Balance -->
              <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                ${{ (user.balance || 0).toFixed(2) }}
              </td>

              <!-- Status -->
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <span :class="['status-dot', getStatusDotClass(user.status)]"></span>
                  <span class="text-sm text-slate-600 dark:text-slate-300">{{ statusLabels[user.status] }}</span>
                </div>
              </td>

              <!-- Created at -->
              <td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                {{ formatDate(user.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-1">
                  <UButton variant="ghost" color="neutral" size="xs" @click="openEditModal(user)">
                    <UIcon name="i-lucide-edit" class="w-4 h-4 mr-1" />
                    编辑
                  </UButton>
                  <UButton
                    variant="ghost"
                    :color="user.status === 'ACTIVE' ? 'warning' : 'success'"
                    size="xs"
                    @click="toggleUserStatus(user)"
                  >
                    <UIcon :name="user.status === 'ACTIVE' ? 'i-lucide-ban' : 'i-lucide-check'" class="w-4 h-4 mr-1" />
                    {{ user.status === 'ACTIVE' ? '禁用' : '启用' }}
                  </UButton>
                  <UDropdownMenu :items="getMoreActions(user)">
                    <UButton variant="ghost" color="neutral" size="xs">
                      <UIcon name="i-lucide-more-horizontal" class="w-4 h-4" />
                      更多
                    </UButton>
                  </UDropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination footer -->
      <template #footer>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-500 dark:text-slate-400">
              显示 {{ startIndex }} 至 {{ endIndex }} 共 {{ meta.total }} 条结果
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500">每页:</span>
              <USelectMenu
                v-model="pageSize"
                :options="pageSizeOptions"
                size="xs"
                class="w-20"
              />
            </div>
          </div>
          <UPagination
            v-model:page="page"
            :total="meta.total"
            :page-count="pageSize"
          />
        </div>
      </template>
    </UCard>

    <!-- Create/Edit modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-800 dark:text-white">
                {{ editingUser ? '编辑用户' : '创建用户' }}
              </h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="showModal = false">
                <UIcon name="i-lucide-x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <UForm :state="form" :schema="formSchema" @submit="onSubmit" class="space-y-4">
            <UFormField name="name" label="姓名">
              <UInput v-model="form.name" placeholder="请输入姓名" />
            </UFormField>

            <UFormField name="email" label="邮箱">
              <UInput v-model="form.email" type="email" placeholder="请输入邮箱" :disabled="!!editingUser" />
            </UFormField>

            <UFormField v-if="!editingUser" name="password" label="密码">
              <UInput v-model="form.password" type="password" placeholder="请输入密码" />
            </UFormField>

            <div class="flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <UButton variant="outline" color="neutral" @click="showModal = false">取消</UButton>
              <UButton type="submit" :loading="submitting">
                {{ editingUser ? '保存' : '创建' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>

    <!-- Assign roles modal -->
    <UModal v-model:open="showRolesModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-800 dark:text-white">分配角色 - {{ editingUser?.name }}</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="showRolesModal = false">
                <UIcon name="i-lucide-x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="role in allRoles"
              :key="role.id"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              @click="toggleRole(role.id)"
            >
              <UCheckbox
                :model-value="selectedRoles.includes(role.id)"
                @update:model-value="toggleRole(role.id)"
              />
              <div class="flex-1">
                <p class="font-medium text-slate-800 dark:text-white">{{ role.displayName }}</p>
                <p class="text-sm text-slate-500">{{ role.description }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <UButton variant="outline" color="neutral" @click="showRolesModal = false">取消</UButton>
            <UButton @click="saveRoles" :loading="submitting">保存</UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useDebounceFn } from '@vueuse/core';

definePageMeta({
  layout: 'dashboard',
  middleware: 'admin',
});

const api = useApi();
const toast = useToast();

// State
const loading = ref(true);
const users = ref<any[]>([]);
const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 0 });
const page = ref(1);
const pageSize = ref(20);
const search = ref('');

const showModal = ref(false);
const showRolesModal = ref(false);
const editingUser = ref<any>(null);
const submitting = ref(false);

const allRoles = ref<any[]>([]);
const selectedRoles = ref<string[]>([]);

// Constants
const pageSizeOptions = [10, 20, 50, 100];

const statusLabels: Record<string, string> = {
  ACTIVE: '启用',
  INACTIVE: '未激活',
  SUSPENDED: '已禁用',
};

// Computed
const startIndex = computed(() => {
  if (meta.value.total === 0) return 0;
  return (page.value - 1) * pageSize.value + 1;
});

const endIndex = computed(() => {
  return Math.min(page.value * pageSize.value, meta.value.total);
});

// Form
const formSchema = computed(() => {
  const base = {
    name: z.string().min(1, '请输入姓名'),
    email: z.string().email('请输入有效的邮箱'),
  };

  if (!editingUser.value) {
    return z.object({
      ...base,
      password: z.string().min(8, '密码至少8个字符'),
    });
  }

  return z.object(base);
});

const form = reactive({
  name: '',
  email: '',
  password: '',
});

// Helper functions
const getAvatarColor = (email: string) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  ];
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitial = (email: string) => {
  return email.charAt(0).toUpperCase();
};

const getRoleBadgeColor = (roleName: string) => {
  if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') return 'primary';
  return 'info';
};

const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'active';
    case 'INACTIVE': return 'inactive';
    case 'SUSPENDED': return 'suspended';
    default: return 'inactive';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: pageSize.value.toString(),
    });
    if (search.value) params.set('search', search.value);

    const data = await api.get<any>(`/users?${params}`);
    users.value = data.items;
    meta.value = data.meta;
  } catch (error) {
    console.error('Failed to fetch users', error);
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    allRoles.value = await api.get('/roles');
  } catch (error) {
    console.error('Failed to fetch roles', error);
  }
};

const refreshData = () => {
  fetchUsers();
};

const debouncedSearch = useDebounceFn(() => {
  page.value = 1;
  fetchUsers();
}, 300);

const openCreateModal = () => {
  editingUser.value = null;
  form.name = '';
  form.email = '';
  form.password = '';
  showModal.value = true;
};

const openEditModal = (user: any) => {
  editingUser.value = user;
  form.name = user.name;
  form.email = user.email;
  form.password = '';
  showModal.value = true;
};

const openRolesModal = (user: any) => {
  editingUser.value = user;
  selectedRoles.value = user.roles?.map((r: any) => r.id) || [];
  showRolesModal.value = true;
};

const toggleRole = (roleId: string) => {
  const index = selectedRoles.value.indexOf(roleId);
  if (index > -1) {
    selectedRoles.value.splice(index, 1);
  } else {
    selectedRoles.value.push(roleId);
  }
};

const onSubmit = async () => {
  submitting.value = true;
  try {
    if (editingUser.value) {
      await api.patch(`/users/${editingUser.value.id}`, { name: form.name });
    } else {
      await api.post('/users', form);
    }
    toast.add({ title: '保存成功', color: 'success' });
    showModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' });
  } finally {
    submitting.value = false;
  }
};

const saveRoles = async () => {
  submitting.value = true;
  try {
    await api.patch(`/users/${editingUser.value.id}/roles`, { roleIds: selectedRoles.value });
    toast.add({ title: '保存成功', color: 'success' });
    showRolesModal.value = false;
    fetchUsers();
  } catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' });
  } finally {
    submitting.value = false;
  }
};

const toggleUserStatus = async (user: any) => {
  const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    await api.patch(`/users/${user.id}`, { status: newStatus });
    toast.add({ title: newStatus === 'ACTIVE' ? '已启用' : '已禁用', color: 'success' });
    fetchUsers();
  } catch (error: any) {
    toast.add({ title: '操作失败', description: error.message, color: 'error' });
  }
};

const deleteUser = async (user: any) => {
  if (!confirm(`确定要删除用户 "${user.name || user.email}" 吗？`)) return;

  try {
    await api.del(`/users/${user.id}`);
    toast.add({ title: '删除成功', color: 'success' });
    fetchUsers();
  } catch (error: any) {
    toast.add({ title: '删除失败', description: error.message, color: 'error' });
  }
};

const getMoreActions = (user: any) => [
  [
    { label: '分配角色', icon: 'i-lucide-shield', click: () => openRolesModal(user) },
  ],
  [
    { label: '删除', icon: 'i-lucide-trash', click: () => deleteUser(user) },
  ],
];

// Watchers
watch([page, pageSize], () => fetchUsers());

// Init
onMounted(() => {
  fetchUsers();
  fetchRoles();
});
</script>
