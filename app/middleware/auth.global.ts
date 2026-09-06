export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  auth.hydrate()

  if (to.path === '/login') {
    if (auth.token && !auth.user) {
      await auth.fetchMe()
    }

    if (auth.isAuthenticated) {
      return navigateTo('/orders')
    }

    return
  }

  if (!auth.token) {
    return navigateTo('/login')
  }

  if (!auth.user) {
    await auth.fetchMe()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
