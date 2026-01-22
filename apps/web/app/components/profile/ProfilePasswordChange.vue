<script setup lang="ts">
import { z } from 'zod'

const api = useApi()
const toast = useToast()

const saving = ref(false)
const showPassword = reactive({
  current: false,
  new: false,
  confirm: false,
})

const schema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(8, '新密码至少8个字符'),
  confirmPassword: z.string().min(8, '请确认新密码'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function onSubmit() {
  saving.value = true
  try {
    await api.patch('/profile/password', form)
    toast.add({ title: '密码修改成功', color: 'success' })
    // Reset form
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  }
  catch (error: any) {
    toast.add({ title: '修改失败', description: error.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        修改密码
      </h3>
    </template>

    <UForm :state="form" :schema="schema" class="space-y-4" @submit="onSubmit">
      <UFormField name="currentPassword" label="当前密码">
        <UInput
          v-model="form.currentPassword"
          :type="showPassword.current ? 'text' : 'password'"
          placeholder="请输入当前密码"
        >
          <template #trailing>
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="showPassword.current ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showPassword.current = !showPassword.current"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="newPassword" label="新密码">
        <UInput
          v-model="form.newPassword"
          :type="showPassword.new ? 'text' : 'password'"
          placeholder="请输入新密码（至少8个字符）"
        >
          <template #trailing>
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="showPassword.new ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showPassword.new = !showPassword.new"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="confirmPassword" label="确认新密码">
        <UInput
          v-model="form.confirmPassword"
          :type="showPassword.confirm ? 'text' : 'password'"
          placeholder="请再次输入新密码"
        >
          <template #trailing>
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              :icon="showPassword.confirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showPassword.confirm = !showPassword.confirm"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton type="submit" :loading="saving">
        修改密码
      </UButton>
    </UForm>
  </UCard>
</template>
