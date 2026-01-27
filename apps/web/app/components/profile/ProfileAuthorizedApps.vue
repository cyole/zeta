<script setup lang="ts">
import type { UserGrant } from '~/composables/useApplication'

const { getUserGrants, revokeGrant } = useApplication()

const loading = ref(true)
const grants = ref<UserGrant[]>([])

const revokeModal = ref(false)
const revokingGrant = ref<UserGrant | null>(null)

async function loadGrants() {
  loading.value = true
  try {
    grants.value = await getUserGrants()
  }
  catch (e: any) {
    console.error('Failed to load grants:', e)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGrants()
})

function handleRevoke(grant: UserGrant) {
  revokingGrant.value = grant
  revokeModal.value = true
}

async function confirmRevoke() {
  if (!revokingGrant.value)
    return

  try {
    await revokeGrant(revokingGrant.value.application.id)
    revokeModal.value = false
    revokingGrant.value = null
    await loadGrants()
  }
  catch (e: any) {
    console.error('Failed to revoke grant:', e)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">
        已授权应用
      </h2>
      <UButton
        v-if="grants.length > 0"
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-ccw"
        :loading="loading"
        @click="loadGrants"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading && grants.length === 0" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-primary-600" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && grants.length === 0" class="py-6 text-center">
      <UIcon name="i-lucide-shield-check" class="mx-auto mb-3 h-10 w-10 text-neutral-400" />
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        没有已授权的应用
      </p>
    </div>

    <!-- Grants List -->
    <div v-else class="space-y-3">
      <div
        v-for="grant in grants"
        :key="grant.id"
        class="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400">
            <img
              v-if="grant.application.logo"
              :src="grant.application.logo"
              :alt="grant.application.name"
              class="h-6 w-6 rounded object-cover"
            >
            <UIcon v-else name="i-lucide-apps" class="h-5 w-5 text-white" />
          </div>
          <div>
            <div class="font-medium text-neutral-900 dark:text-white">
              {{ grant.application.name }}
            </div>
            <div class="text-xs text-neutral-500">
              授权于 {{ formatDate(grant.authorizedAt) }}
            </div>
          </div>
        </div>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          @click="handleRevoke(grant)"
        />
      </div>
    </div>

    <!-- Footer -->
    <div v-if="grants.length > 0" class="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      <p class="text-xs text-neutral-500">
        <UIcon name="i-lucide-info" class="mr-1 inline-block h-3 w-3 align-middle" />
        撤销授权后，相应应用将无法访问您的账号信息
      </p>
    </div>

    <!-- Revoke Modal -->
    <UModal v-model:open="revokeModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-amber-600" />
              <span class="font-medium">确认撤销授权</span>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-neutral-700 dark:text-neutral-300">
              确定要撤销应用 <span class="font-medium text-neutral-900 dark:text-white">{{ revokingGrant?.application.name }}</span> 的授权吗？
            </p>
            <div class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              撤销后，该应用将无法访问您的账号信息，已颁发的 token 将失效。
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="revokeModal = false">
                取消
              </UButton>
              <UButton color="error" variant="solid" @click="confirmRevoke">
                确认撤销
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
