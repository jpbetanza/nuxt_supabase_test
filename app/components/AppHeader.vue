<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const toast = useToast()

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    toast.add({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
      color: 'success'
    })

    await navigateTo('/login')
  } catch (error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined
    toast.add({
      title: 'Erro',
      description: message || 'Erro ao fazer logout',
      color: 'error'
    })
  }
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center space-x-2"
      >
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <UIcon
            name="i-lucide-zap"
            class="w-5 h-5 text-white dark:text-white"
          />
        </div>
        <span class="font-semibold text-lg">Plataforma SaaS</span>
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <div
        v-if="user"
        class="flex items-center gap-4"
      >
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Olá, {{ user.email }}
        </span>
        <UButton
          variant="outline"
          size="sm"
          icon="i-lucide-log-out"
          @click="handleLogout"
        >
          Sair
        </UButton>
      </div>

      <div
        v-else
        class="flex items-center gap-2"
      >
        <UButton
          to="/login"
          variant="subtle"
          size="sm"
        >
          Entrar
        </UButton>

        <UButton
          to="/login"
          color="primary"
          size="sm"
        >
          Começar
        </UButton>
      </div>
    </template>
  </UHeader>
</template>

