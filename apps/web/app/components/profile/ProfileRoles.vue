<script setup lang="ts">
const { user } = useAuth()
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold">
        我的角色
      </h3>
    </template>
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="role in user?.roles"
        :key="role.name"
        color="primary"
        variant="subtle"
        size="lg"
      >
        {{ role.displayName }}
      </UBadge>
      <span v-if="!user?.roles?.length" class="text-sm text-neutral-500">
        暂无角色
      </span>
    </div>
  </UCard>
</template>
