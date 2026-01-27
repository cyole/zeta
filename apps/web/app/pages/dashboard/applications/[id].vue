<script setup lang="ts">
import type { Application } from '~/composables/useApplication'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const { getApplication, regenerateSecret, deleteApplication } = useApplication()
const toast = useToast()

const loading = ref(true)
const regenerating = ref(false)
const application = ref<Application | null>(null)

// 编辑弹窗
const showEditModal = ref(false)

// Secret 相关
const showSecretModal = ref(false)
const newSecret = ref('')
const copiedSecret = ref(false)

// 删除确认
const deleteModal = ref(false)

const appId = route.params.id as string

async function loadApplication() {
  loading.value = true
  try {
    const data = await getApplication(appId)
    application.value = data
  }
  catch (e: any) {
    console.error('Failed to load application:', e)
    const message = e.response?._data?.message || e.message || '加载失败'
    toast.add({ title: message, color: 'error' })
    if (e.message?.includes('不存在') || e.message?.includes('无权')) {
      router.push('/dashboard/applications')
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplication()
})

function handleEditSuccess() {
  loadApplication()
}

async function handleRegenerateSecret() {
  regenerating.value = true
  try {
    const result = await regenerateSecret(appId)
    newSecret.value = result.clientSecret
    showSecretModal.value = true
  }
  catch (e: any) {
    console.error('Failed to regenerate secret:', e)
    const message = e.response?._data?.message || e.message || '重新生成失败'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    regenerating.value = false
  }
}

async function copySecret() {
  await navigator.clipboard.writeText(newSecret.value)
  copiedSecret.value = true
  toast.add({ title: '已复制到剪贴板' })
}

async function copyClientId() {
  if (application.value?.clientId) {
    await navigator.clipboard.writeText(application.value.clientId)
    toast.add({ title: '已复制到剪贴板' })
  }
}

function handleDelete() {
  deleteModal.value = true
}

async function confirmDelete() {
  try {
    await deleteApplication(appId)
    toast.add({ title: '应用已删除' })
    deleteModal.value = false
    router.push('/dashboard/applications')
  }
  catch (e: any) {
    console.error('Failed to delete application:', e)
    const message = e.response?._data?.message || e.message || '删除失败'
    toast.add({ title: message, color: 'error' })
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <!-- Content -->
    <div v-else-if="application" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton
            to="/dashboard/applications"
            variant="ghost"
            color="neutral"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-left" />
            </template>
          </UButton>
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400">
            <img
              v-if="application.logo"
              :src="application.logo"
              :alt="application.name"
              class="h-10 w-10 rounded-lg object-cover"
            >
            <UIcon v-else name="i-lucide-apps" class="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ application.name }}
            </h1>
            <p v-if="application.description" class="text-neutral-600 dark:text-neutral-400">
              {{ application.description }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-edit"
            @click="showEditModal = true"
          >
            编辑
          </UButton>
          <UButton
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="handleDelete"
          />
        </div>
      </div>

      <!-- Credentials Card -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-neutral-900 dark:text-white">
            凭证信息
          </h2>
        </template>

        <div class="space-y-4">
          <!-- Client ID -->
          <div>
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              Client ID
            </div>
            <div class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <code class="flex-1 text-sm text-neutral-900 dark:text-white">{{ application.clientId }}</code>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                @click="copyClientId"
              />
            </div>
          </div>

          <!-- Client Secret -->
          <div>
            <div class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              Client Secret
              <span class="ml-2 text-xs text-neutral-400">(仅创建时显示一次)</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <code class="flex-1 text-sm text-neutral-900 dark:text-white">••••••••••••••••••••••••••••••••</code>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
                :loading="regenerating"
                @click="handleRegenerateSecret"
              >
                重新生成
              </UButton>
            </div>
            <div class="mt-1.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <UIcon name="i-lucide-alert-triangle" class="h-3 w-3" />
              <span>复制将生成新的 Secret，旧的将立即失效</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Info Grid -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Redirect URIs Card -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-neutral-900 dark:text-white">
              回调地址
            </h2>
          </template>

          <div class="space-y-2">
            <div
              v-for="(uri, index) in application.redirectUris"
              :key="index"
              class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <code class="flex-1 text-sm text-neutral-900 dark:text-white">{{ uri }}</code>
            </div>
          </div>
        </UCard>

        <!-- Stats Card -->
        <UCard>
          <template #header>
            <h2 class="font-semibold text-neutral-900 dark:text-white">
              应用统计
            </h2>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <div class="text-2xl font-bold text-neutral-900 dark:text-white">
                {{ application._count?.userGrants || 0 }}
              </div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">
                授权用户
              </div>
            </div>
            <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <div class="text-2xl font-bold text-neutral-900 dark:text-white">
                {{ new Date(application.createdAt).toLocaleDateString() }}
              </div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">
                创建时间
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Status Card -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-neutral-900 dark:text-white">
            应用状态
          </h2>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400">
              当前状态
            </div>
            <div class="flex items-center gap-2">
              <div
                class="h-2 w-2 rounded-full"
                :class="application.isActive ? 'bg-green-500' : 'bg-gray-400'"
              />
              <span class="font-medium text-neutral-900 dark:text-white">
                {{ application.isActive ? '启用中' : '已禁用' }}
              </span>
            </div>
          </div>
          <UButton
            v-if="application.homepage"
            :to="application.homepage"
            target="_blank"
            color="neutral"
            variant="ghost"
            icon="i-lucide-external-link"
          >
            访问应用
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Edit Modal -->
    <ApplicationFormModal
      v-model:open="showEditModal"
      :application="application"
      @success="handleEditSuccess"
    />

    <!-- Secret Modal -->
    <UModal v-model:open="showSecretModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-key" class="h-5 w-5 text-primary-600" />
                <span class="font-medium">新的 Client Secret</span>
              </div>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="showSecretModal = false" />
            </div>
          </template>

          <div class="space-y-4">
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
              <UIcon name="i-lucide-alert-triangle" class="mr-1 inline-block h-4 w-4 align-middle" />
              请立即复制并保存新的 Client Secret，关闭此窗口后将无法再次查看。
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                <code class="flex-1 break-all text-sm text-neutral-900 dark:text-white">
                  {{ newSecret }}
                </code>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-copy"
                  @click="copySecret"
                >
                  复制
                </UButton>
              </div>
              <div v-if="copiedSecret" class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <UIcon name="i-lucide-check" class="h-3 w-3" />
                <span>已复制到剪贴板</span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                variant="solid"
                color="primary"
                @click="showSecretModal = false; newSecret = ''; copiedSecret = false"
              >
                我已保存
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

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
              确定要删除应用 <span class="font-medium text-neutral-900 dark:text-white">{{ application?.name }}</span> 吗？
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
