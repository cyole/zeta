<script setup lang="ts">
const { user } = useAuth()

function formatDate(date?: string | null) {
  if (!date)
    return '-'
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        账号信息
      </h3>
    </template>
    <dl class="space-y-2 text-sm">
      <div class="flex justify-between">
        <dt class="text-neutral-500">
          账号状态
        </dt>
        <dd>
          <UBadge :color="user?.status === 'ACTIVE' ? 'success' : 'error'" variant="subtle">
            {{ user?.status === 'ACTIVE' ? '正常' : '异常' }}
          </UBadge>
        </dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-neutral-500">
          注册时间
        </dt>
        <dd>{{ formatDate(user?.createdAt) }}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-neutral-500">
          最后登录
        </dt>
        <dd>{{ formatDate(user?.lastLoginAt) }}</dd>
      </div>
    </dl>
  </UCard>
</template>
