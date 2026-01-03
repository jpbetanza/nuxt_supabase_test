<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

// Estados
const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)
const timeoutId = ref<NodeJS.Timeout | null>(null)
const debugInfo = ref<string>('')
const showResendModal = ref(false)
const resendEmail = ref('')

// Verificar se estamos em modo desenvolvimento
const isDev = import.meta.env.DEV

// Função para limpar timeout
const clearConfirmationTimeout = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
}

// Função para reenviar link de confirmação
const resendConfirmationLink = async (email: string) => {
  try {
    loading.value = true
    error.value = null

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })

    if (resendError) throw resendError

    toast.add({
      title: 'Link enviado!',
      description: 'Um novo link de confirmação foi enviado para seu email.',
      color: 'success'
    })

    // Redirecionar para login após um tempo
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : undefined
    error.value = message || 'Erro ao reenviar link'
    toast.add({
      title: 'Erro',
      description: error.value,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Verificar status da sessão atual
const checkSession = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }

    return session
  } catch (err) {
    console.error('Error checking session:', err)
    return null
  }
}

// Verificar confirmação de email
const checkEmailConfirmation = async () => {
  try {
    const session = await checkSession()

    if (session?.user) {
      const user = session.user

      debugInfo.value = `Sessão encontrada - Email: ${user.email}\nConfirmado: ${user.email_confirmed_at || user.confirmed_at || 'Não'}\nID: ${user.id}\nÚltima tentativa: ${new Date().toLocaleTimeString()}`

      // Verificar se o email foi confirmado
      if (user.email_confirmed_at || user.confirmed_at) {
        success.value = true
        clearConfirmationTimeout()
        toast.add({
          title: 'Sucesso!',
          description: 'Seu email foi confirmado com sucesso.',
          color: 'success'
        })

        // Redirecionar para a página inicial após alguns segundos
        setTimeout(() => {
          router.push('/')
        }, 3000)
        return true
      }

      console.log('User found but email not confirmed:', {
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        confirmed_at: user.confirmed_at,
        user_metadata: user.user_metadata
      })
    } else {
      debugInfo.value = `Nenhuma sessão encontrada - ${new Date().toLocaleTimeString()}`
      console.log('No session found')
    }

    return false
  } catch (err: unknown) {
    console.error('Error in checkEmailConfirmation:', err)
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : undefined
    error.value = message || 'Erro ao verificar confirmação'
    debugInfo.value = `Erro: ${error.value}`
    return false
  }
}

// Função de confirmação que tenta verificar periodicamente
const startConfirmationCheck = () => {
  let attempts = 0
  const maxAttempts = 30 // 30 segundos máximo

  const checkConfirmation = async () => {
    attempts++

    console.log(`Confirmation check attempt ${attempts}/${maxAttempts}`)

    const isConfirmed = await checkEmailConfirmation()

    if (isConfirmed) {
      loading.value = false
      return
    }

    if (attempts >= maxAttempts) {
      loading.value = false
      error.value = 'Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.'
      debugInfo.value = `Tempo limite excedido após ${attempts} tentativas`
      toast.add({
        title: 'Erro',
        description: error.value,
        color: 'error'
      })
      return
    }

    debugInfo.value = `Verificando... Tentativa ${attempts}/${maxAttempts}`
    // Tentar novamente em 1 segundo
    timeoutId.value = setTimeout(checkConfirmation, 1000)
  }

  checkConfirmation()
}

// Método para tentar novamente
const retryConfirmation = async () => {
  loading.value = true
  error.value = null
  success.value = false

  const isConfirmed = await checkEmailConfirmation()

  if (!isConfirmed) {
    startConfirmationCheck()
  } else {
    loading.value = false
  }
}

// Verificar se há erros na URL (link expirado, etc.)
const checkForUrlErrors = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)) // Remove the '#'
      const urlError = params.get('error')
      const errorCode = params.get('error_code')
      const errorDescription = params.get('error_description')

      if (urlError === 'access_denied' && errorCode === 'otp_expired') {
        loading.value = false
        error.value = 'O link de confirmação expirou. Solicite um novo link de confirmação.'
        toast.add({
          title: 'Link expirado',
          description: 'O link de confirmação expirou. Faça login novamente para receber um novo link.',
          color: 'warning'
        })
        return true
      }

      if (errorDescription) {
        loading.value = false
        error.value = `Erro na confirmação: ${errorDescription.replace(/\+/g, ' ')}`
        return true
      }
    }
  }
  return false
}

// Executar verificação ao montar o componente
onMounted(() => {
  console.log('Confirm page mounted, starting confirmation check')

  // Log URL parameters for debugging
  if (typeof window !== 'undefined') {
    console.log('URL:', window.location.href)
    console.log('Hash:', window.location.hash)
    console.log('Search:', window.location.search)
  }

  // Primeiro, verificar se há erros na URL
  if (checkForUrlErrors()) {
    return
  }

  // Se não há erros, tentar verificar imediatamente
  checkEmailConfirmation().then((isConfirmed) => {
    if (!isConfirmed) {
      // Se não conseguiu confirmar imediatamente, começar verificação periódica
      startConfirmationCheck()
    } else {
      loading.value = false
    }
  })
})

// Limpar timeout ao desmontar
onUnmounted(() => {
  clearConfirmationTimeout()
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
          <p class="text-gray-600 dark:text-gray-400 text-center">
            Verificando se seu email foi confirmado.<br>
            <span class="text-sm text-gray-500">Isso pode levar alguns segundos.</span>
          </p>
          <div class="text-center">
            <p class="text-xs text-gray-400 mt-4">
              Se você foi redirecionado do email,<br>
              aguarde enquanto processamos sua confirmação.
            </p>
            <div class="mt-6 space-y-2">
              <UButton
                variant="outline"
                size="sm"
                @click="router.push('/login')"
              >
                Já confirmou? Fazer login
              </UButton>
              <!-- Debug info (only in development) -->
              <div
                v-if="isDev"
                class="text-xs text-gray-500 mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded"
              >
                <strong>Debug:</strong><br>
                {{ debugInfo }}
              </div>
            </div>
          </div>
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
          <div class="flex flex-col gap-3 items-center">
            <div class="flex gap-2">
              <UButton
                v-if="!error.includes('expirou') && !error.includes('expirado')"
                :loading="loading"
                variant="outline"
                @click="retryConfirmation"
              >
                Tentar novamente
              </UButton>
              <UButton
                color="primary"
                @click="$router.push('/login')"
              >
                {{ error.includes('expirou') || error.includes('expirado') ? 'Fazer login' : 'Voltar ao login' }}
              </UButton>
            </div>

            <!-- Opção para reenviar link quando expirado -->
            <div
              v-if="error.includes('expirou') || error.includes('expirado')"
              class="text-center"
            >
              <p class="text-sm text-gray-500 mb-2">
                Ou solicite um novo link:
              </p>
              <UButton
                variant="link"
                size="sm"
                @click="showResendModal = true"
              >
                Reenviar link de confirmação
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </UPageCard>

    <!-- Modal para reenviar link -->
    <UModal v-model="showResendModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Reenviar link de confirmação
          </h3>
        </template>

        <UForm @submit="() => resendConfirmationLink(resendEmail)">
          <UFormGroup
            label="Email"
            required
          >
            <UInput
              v-model="resendEmail"
              type="email"
              placeholder="Digite seu email"
            />
          </UFormGroup>

          <div class="flex gap-2 justify-end">
            <UButton
              variant="outline"
              @click="showResendModal = false"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              :loading="loading"
              :disabled="!resendEmail"
            >
              Enviar
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
