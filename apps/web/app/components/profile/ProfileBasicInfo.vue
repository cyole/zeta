<script setup lang="ts">
import { z } from 'zod'

const { user, fetchUser } = useAuth()
const api = useApi()
const toast = useToast()

const saving = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement>()

const schema = z.object({
  name: z.string().min(1, '请输入姓名'),
})

const form = reactive({
  name: user.value?.name || '',
})

watch(() => user.value?.name, (name) => {
  if (name)
    form.name = name
}, { immediate: true })

async function onSubmit() {
  saving.value = true
  try {
    await api.patch(`/users/${user.value?.id}`, { name: form.name })
    await fetchUser()
    toast.add({ title: '保存成功', color: 'success' })
  }
  catch (error: any) {
    toast.add({ title: '保存失败', description: error.message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  // Validate file
  const maxSize = 5 * 1024 * 1024
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (file.size > maxSize) {
    toast.add({ title: '文件过大', description: '最大支持 5MB', color: 'error' })
    input.value = ''
    return
  }

  if (!acceptedTypes.includes(file.type)) {
    toast.add({ title: '文件类型不支持', description: '请上传 JPG、PNG、GIF 或 WebP 图片', color: 'error' })
    input.value = ''
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    await api.upload('/profile/avatar', formData)
    await fetchUser()
    toast.add({ title: '头像更新成功', color: 'success' })
  }
  catch (error: any) {
    toast.add({ title: '上传失败', description: error.message, color: 'error' })
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        基本信息
      </h3>
    </template>

    <UForm :state="form" :schema="schema" class="space-y-6" @submit="onSubmit">
      <!-- Avatar -->
      <div class="flex items-center gap-4">
        <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="xl" />
        <div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          >
          <UButton variant="outline" size="sm" :loading="uploading" @click="triggerFileSelect">
            更换头像
          </UButton>
          <p class="mt-1 text-xs text-neutral-500">
            支持 JPG、PNG、GIF，最大 5MB
          </p>
        </div>
      </div>

      <UFormField name="name" label="姓名">
        <UInput v-model="form.name" placeholder="请输入姓名" size="lg" />
      </UFormField>

      <UFormField name="email" label="邮箱">
        <UInput :model-value="user?.email" disabled size="lg" />
        <template #hint>
          <span v-if="user?.emailVerified" class="text-green-600 dark:text-green-400">
            ✓ 已验证
          </span>
          <span v-else class="text-amber-600 dark:text-amber-400">
            未验证
          </span>
        </template>
      </UFormField>

      <UButton type="submit" :loading="saving">
        保存修改
      </UButton>
    </UForm>
  </UCard>
</template>
