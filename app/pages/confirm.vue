<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

// Estados
const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

// Verificar se há parâmetros de confirmação na URL
const confirmEmail = async () => {
  try {
    // O Supabase automaticamente lida com a confirmação através dos parâmetros da URL
    // Vamos verificar se o usuário está autenticado após a confirmação
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (user && user.email_confirmed_at) {
      success.value = true
      toast.add({
        title: 'Sucesso!',
        description: 'Seu email foi confirmado com sucesso.',
        color: 'green'
      })

      // Redirecionar para a página inicial após alguns segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      throw new Error('Não foi possível confirmar o email')
    }
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : undefined
    error.value = message || 'Erro ao confirmar email'
    toast.add({
      title: 'Erro',
      description: error.value,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// Executar verificação ao montar o componente
onMounted(() => {
  confirmEmail()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
    <UPageCard class="w-full max-w-md">
      <div class="text-center">
        <!-- Estado de loading -->
        <div
          v-if="loading"
          class="flex flex-col items-center gap-4"
        >
          <UIcon
            name="i-lucide-loader"
            class="size-12 animate-spin text-primary"
          />
          <h2 class="text-xl font-semibold">
            Confirmando seu email...
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Aguarde enquanto verificamos sua confirmação.
          </p>
        </div>

        <!-- Estado de sucesso -->
        <div
          v-else-if="success"
          class="flex flex-col items-center gap-4"
        >
          <UIcon
            name="i-lucide-check-circle"
            class="size-12 text-green-500"
          />
          <h2 class="text-xl font-semibold text-green-600 dark:text-green-400">
            Email confirmado!
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Seu email foi confirmado com sucesso. Você será redirecionado automaticamente.
          </p>
          <UProgress
            :value="75"
            class="w-full mt-4"
            :indeterminate="false"
          />
          <p class="text-sm text-gray-500">
            Redirecionando em alguns segundos...
          </p>
        </div>

        <!-- Estado de erro -->
        <div
          v-else-if="error"
          class="flex flex-col items-center gap-4"
        >
          <UIcon
            name="i-lucide-x-circle"
            class="size-12 text-red-500"
          />
          <h2 class="text-xl font-semibold text-red-600 dark:text-red-400">
            Erro na confirmação
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ error }}
          </p>
          <div class="flex gap-2">
            <UButton
              :loading="loading"
              variant="outline"
              @click="confirmEmail"
            >
              Tentar novamente
            </UButton>
            <UButton
              color="primary"
              @click="$router.push('/login')"
            >
              Voltar ao login
            </UButton>
          </div>
        </div>
      </div>
    </UPageCard>
  </div>
</template>
