<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        个人设置
      </h1>
      <p class="text-neutral-500">
        管理您的账号信息和偏好设置
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <ProfileBasicInfo />
        <ProfilePasswordChange />
        <ProfileNotificationSettings />
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <ProfileRoles />
        <ProfileOAuthAccounts />
        <ProfileAccountInfo />
      </div>
    </div>
  </div>
</template>
