<script setup lang="ts">
import type { Application, CreateApplicationDto, UpdateApplicationDto } from '~/composables/useApplication'

import { z } from 'zod'

const props = defineProps<{
  open: boolean
  application?: Application | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const { createApplication, updateApplication } = useApplication()
const toast = useToast()

const formLoading = ref(false)

// 自定义 URL 验证器
const urlValidator = z.string().refine(
  val => !val || /^https?:\/\//.test(val),
  { message: '请输入有效的 URL' },
)

// Zod 验证 schema
const schema = z.object({
  name: z.string().min(2, '应用名称至少需要 2 个字符').max(50, '应用名称最多 50 个字符'),
  description: z.string().max(500, '应用描述最多 500 个字符').optional(),
  homepage: urlValidator.optional(),
  redirectUris: z.array(z.string().refine(
    val => !val || /^https?:\/\//.test(val),
    { message: '请输入有效的 URL' },
  )).min(1, '至少需要一个回调地址').max(5, '最多支持 5 个回调地址'),
  logo: urlValidator.optional(),
  isActive: z.boolean().optional(),
})

// 表单数据
const form = reactive({
  name: '',
  description: '',
  homepage: '',
  redirectUris: [''] as string[],
  logo: '',
  isActive: true,
})

// 监听弹窗打开，初始化表单
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.application) {
      // 编辑模式
      Object.assign(form, {
        name: props.application.name,
        description: props.application.description || '',
        homepage: props.application.homepage || '',
        redirectUris: [...props.application.redirectUris],
        logo: props.application.logo || '',
        isActive: props.application.isActive ?? true,
      })
    }
    else {
      // 新建模式
      Object.assign(form, {
        name: '',
        description: '',
        homepage: '',
        redirectUris: [''],
        logo: '',
        isActive: true,
      })
    }
  }
})

async function handleSubmit() {
  formLoading.value = true
  try {
    const validUris = form.redirectUris.filter(uri => uri.trim())

    if (props.application) {
      // 编辑模式 - 使用 UpdateApplicationDto
      const updateData: UpdateApplicationDto = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        homepage: form.homepage?.trim() || undefined,
        redirectUris: validUris,
        logo: form.logo?.trim() || undefined,
        isActive: form.isActive ?? true,
      }
      await updateApplication(props.application.id, updateData)
      toast.add({ title: '应用已更新' })
    }
    else {
      // 新建模式 - 使用 CreateApplicationDto
      const createData: CreateApplicationDto = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        homepage: form.homepage?.trim() || undefined,
        redirectUris: validUris,
        logo: form.logo?.trim() || undefined,
      }
      await createApplication(createData)
      toast.add({ title: '应用已创建' })
    }

    emit('update:open', false)
    emit('success')
  }
  catch (e: any) {
    console.error('Failed to save application:', e)
  }
  finally {
    formLoading.value = false
  }
}

function addRedirectUri() {
  if (form.redirectUris.length < 5) {
    form.redirectUris.push('')
  }
}

function removeRedirectUri(index: number) {
  if (form.redirectUris.length > 1) {
    form.redirectUris.splice(index, 1)
  }
}

const isEdit = computed(() => !!props.application)
</script>

<template>
  <UModal :model-value="open" @update:model-value="emit('update:open', $event)">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ isEdit ? '编辑应用' : '创建应用' }}
            </h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="emit('update:open', false)" />
          </div>
        </template>

        <UForm :state="form" :schema="schema" class="space-y-5" @submit="handleSubmit">
          <!-- 应用名称 -->
          <UFormField name="name" label="应用名称" required>
            <UInput
              v-model="form.name"
              placeholder="例如：我的应用"
              maxlength="50"
              show-count
              :disabled="formLoading"
            />
          </UFormField>

          <!-- 应用描述 -->
          <UFormField name="description" label="应用描述">
            <UTextarea
              v-model="form.description"
              placeholder="简单描述一下你的应用..."
              maxlength="500"
              show-count
              :rows="2"
              :disabled="formLoading"
            />
          </UFormField>

          <!-- 应用首页 -->
          <UFormField name="homepage" label="应用首页">
            <UInput
              v-model="form.homepage"
              placeholder="https://example.com"
              :disabled="formLoading"
            />
            <template #hint>
              应用的官方网站 URL（可选）
            </template>
          </UFormField>

          <!-- 回调地址 -->
          <UFormField label="回调地址" required>
            <div class="space-y-2">
              <div
                v-for="(_, index) in form.redirectUris"
                :key="index"
                class="flex gap-2"
              >
                <UInput
                  v-model="form.redirectUris[index]"
                  placeholder="https://example.com/callback"
                  :disabled="formLoading"
                  class="flex-1"
                />
                <UButton
                  v-if="form.redirectUris.length > 1"
                  size="md"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-minus"
                  :disabled="formLoading"
                  @click="removeRedirectUri(index)"
                />
              </div>
              <UButton
                v-if="form.redirectUris.length < 5"
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-plus"
                :disabled="formLoading"
                @click="addRedirectUri"
              >
                添加回调地址
              </UButton>
            </div>
            <template #hint>
              OAuth 授权完成后的跳转地址，最多支持 5 个
            </template>
          </UFormField>

          <!-- 应用 Logo -->
          <UFormField name="logo" label="应用 Logo">
            <UInput
              v-model="form.logo"
              placeholder="https://example.com/logo.png"
              :disabled="formLoading"
            />
            <template #hint>
              应用的 Logo 图片 URL（可选）
            </template>
          </UFormField>

          <!-- 状态（仅编辑模式显示） -->
          <UFormField v-if="isEdit" label="应用状态">
            <USwitch
              v-model="form.isActive"
              color="primary"
            >
              <template #label>
                <span class="text-neutral-700 dark:text-neutral-300">
                  {{ form.isActive ? '启用' : '禁用' }}
                </span>
              </template>
            </USwitch>
          </UFormField>

          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              type="button"
              variant="ghost"
              color="neutral"
              :disabled="formLoading"
              @click="emit('update:open', false)"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              :loading="formLoading"
            >
              {{ isEdit ? '保存' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
