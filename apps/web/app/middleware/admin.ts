export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin } = usePermissions()
  const { isAuthenticated, isLoading, fetchUser } = useAuth()

  // Wait for auth to initialize
  if (isLoading.value) {
    await fetchUser()
  }

  // Check if authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // Check if admin
  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
