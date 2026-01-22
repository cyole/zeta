<script setup lang="ts">
const api = useApi()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)

interface NotificationPreferences {
  emailEnabled: boolean
  emailOnLogin: boolean
  emailOnPasswordChange: boolean
  emailOnSecurityAlert: boolean
  emailDigest: 'NONE' | 'DAILY' | 'WEEKLY'
  pushEnabled: boolean
  pushOnMention: boolean
  pushOnSystemUpdate: boolean
}

const prefs = reactive<NotificationPreferences>({
  emailEnabled: true,
  emailOnLogin: false,
  emailOnPasswordChange: true,
  emailOnSecurityAlert: true,
  emailDigest: 'NONE',
  pushEnabled: true,
  pushOnMention: true,
  pushOnSystemUpdate: true,
})

const digestOptions = [
  { value: 'NONE', label: '不接收' },
  { value: 'DAILY', label: '每日摘要' },
  { value: 'WEEKLY', label: '每周摘要' },
]

async function fetchPreferences() {
  loading.value = true
  try {
    const data = await api.get<NotificationPreferences>('/profile/notification-preferences')
    Object.assign(prefs, data)
  }
  catch (error) {
    console.error('Failed to fetch preferences', error)
  }
  finally {
    loading.value = false
  }
}

async function savePreferences() {
  saving.value = true
  try {
    await api.patch('/profile/notification-preferences', prefs)
    toast.add({ title: '保存成功', color: 'success' })
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchPreferences()
})
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        通知偏好
      </h3>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary-500" />
    </div>

    <div v-else class="space-y-6">
      <!-- Email notifications -->
      <div>
        <h4 class="text-sm font-medium mb-3">
          邮件通知
        </h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                启用邮件通知
              </p>
              <p class="text-xs text-neutral-500">
                接收邮件形式的通知
              </p>
            </div>
            <USwitch v-model="prefs.emailEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                登录通知
              </p>
              <p class="text-xs text-neutral-500">
                当账号在新设备登录时通知
              </p>
            </div>
            <USwitch v-model="prefs.emailOnLogin" :disabled="!prefs.emailEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                密码变更通知
              </p>
              <p class="text-xs text-neutral-500">
                当密码被修改时通知
              </p>
            </div>
            <USwitch v-model="prefs.emailOnPasswordChange" :disabled="!prefs.emailEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                安全警报
              </p>
              <p class="text-xs text-neutral-500">
                异常登录或安全事件通知
              </p>
            </div>
            <USwitch v-model="prefs.emailOnSecurityAlert" :disabled="!prefs.emailEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                邮件摘要
              </p>
              <p class="text-xs text-neutral-500">
                定期接收活动摘要
              </p>
            </div>
            <USelectMenu
              v-model="prefs.emailDigest"
              :options="digestOptions"
              value-key="value"
              option-key="value"
              :disabled="!prefs.emailEnabled"
              size="sm"
              class="w-28"
            />
          </div>
        </div>
      </div>

      <!-- Push notifications -->
      <div>
        <h4 class="text-sm font-medium mb-3">
          推送通知
        </h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                启用推送通知
              </p>
              <p class="text-xs text-neutral-500">
                接收浏览器推送通知
              </p>
            </div>
            <USwitch v-model="prefs.pushEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                @提及通知
              </p>
              <p class="text-xs text-neutral-500">
                当有人@你时通知
              </p>
            </div>
            <USwitch v-model="prefs.pushOnMention" :disabled="!prefs.pushEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">
                系统更新
              </p>
              <p class="text-xs text-neutral-500">
                重要系统更新通知
              </p>
            </div>
            <USwitch v-model="prefs.pushOnSystemUpdate" :disabled="!prefs.pushEnabled" />
          </div>
        </div>
      </div>

      <UButton :loading="saving" @click="savePreferences">
        保存设置
      </UButton>
    </div>
  </UCard>
</template>
