export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isLoading, fetchUser } = useAuth();

  // Wait for auth to initialize
  if (isLoading.value) {
    await fetchUser();
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }
});
