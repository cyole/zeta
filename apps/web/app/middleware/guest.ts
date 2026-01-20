export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, isLoading, fetchUser } = useAuth()

  // Wait for auth to initialize
  if (isLoading.value) {
    await fetchUser()
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
