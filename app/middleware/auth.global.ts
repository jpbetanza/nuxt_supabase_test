export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Se não estiver autenticado e não estiver nas páginas públicas
  if (!user.value && !['/login', '/confirm'].includes(to.path)) {
    return navigateTo('/login')
  }

  // Se estiver autenticado e tentar acessar login/confirm
  if (user.value && ['/login', '/confirm'].includes(to.path)) {
    return navigateTo('/')
  }
})
