<script setup lang="ts">
import type { Application } from '~/composables/useApplication'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const { getApplication, regenerateSecret } = useApplication()

const loading = ref(true)
const regenerating = ref(false)
const application = ref<Application | null>(null)

// 编辑弹窗
const showEditModal = ref(false)

// Secret 相关
const showSecretModal = ref(false)
const newSecret = ref('')
const showingSecret = ref(false)

const appId = route.params.id as string

async function loadApplication() {
  loading.value = true
  try {
    const data = await getApplication(appId)
    application.value = data
  }
  catch (e: any) {
    console.error('Failed to load application:', e)
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
  }
  finally {
    regenerating.value = false
  }
}

async function copySecret() {
  await navigator.clipboard.writeText(newSecret.value)
}

async function copyClientId() {
  if (application.value?.clientId) {
    await navigator.clipboard.writeText(application.value.clientId)
  }
}

function handleDelete() {
  router.push(`/dashboard/applications/${appId}/delete`)
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
            </div>
            <div class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <code class="flex-1 text-sm text-neutral-900 dark:text-white">••••••••••••••••••••••••••••••••</code>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :loading="regenerating"
                @click="handleRegenerateSecret"
              >
                重新生成
              </UButton>
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
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-key" class="h-5 w-5 text-primary-600" />
              <span class="font-medium">新的 Client Secret</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
              <UIcon name="i-lucide-alert-triangle" class="mr-1 inline-block h-4 w-4 align-middle" />
              请立即复制并保存新的 Client Secret，关闭此窗口后将无法再次查看。
            </div>

            <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <code v-if="showingSecret" class="break-all text-sm text-neutral-900 dark:text-white">
                {{ newSecret }}
              </code>
              <code v-else class="text-sm text-neutral-900 dark:text-white">
                ••••••••••••••••••••••••••••••••
              </code>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton
                v-if="!showingSecret"
                variant="ghost"
                color="neutral"
                @click="showingSecret = true"
              >
                显示 Secret
              </UButton>
              <div v-else class="flex gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-copy"
                  @click="copySecret"
                >
                  复制
                </UButton>
              </div>
              <UButton
                variant="solid"
                color="primary"
                @click="showSecretModal = false; showingSecret = false; newSecret = ''"
              >
                我已保存
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
