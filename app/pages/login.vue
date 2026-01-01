<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()
const toast = useToast()

// Estado para alternar entre login e cadastro
const isLogin = ref(true)

// Estado de loading
const loading = ref(false)

// Estado de erro
const authError = ref<string>('')

// Função de validação para login
const validateLogin = (data: any) => {
  const errors: string[] = []

  if (!data.email || !data.email.includes('@')) {
    errors.push('Email inválido')
  }

  if (!data.password || data.password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres')
  }

  return errors
}

// Função de validação para cadastro
const validateRegister = (data: any) => {
  const errors: string[] = []

  if (!data.email || !data.email.includes('@')) {
    errors.push('Email inválido')
  }

  if (!data.password || data.password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres')
  }

  if (data.password !== data.confirmPassword) {
    errors.push('As senhas não coincidem')
  }

  return errors
}

// Campos do formulário de login
const loginFields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Digite seu email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Senha',
    placeholder: 'Digite sua senha',
    required: true
  }
]

// Campos do formulário de cadastro
const registerFields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Digite seu email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Senha',
    placeholder: 'Digite sua senha',
    required: true
  },
  {
    name: 'confirmPassword',
    type: 'password',
    label: 'Confirmar Senha',
    placeholder: 'Confirme sua senha',
    required: true
  }
]

// Função de login
const handleLogin = async (payload: FormSubmitEvent<any>) => {
  loading.value = true
  authError.value = ''

  // Validação manual
  const errors = validateLogin(payload.data)
  if (errors.length > 0) {
    authError.value = errors.join(', ')
    loading.value = false
    return
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.data.email,
      password: payload.data.password
    })

    if (error) throw error

    toast.add({
      title: 'Sucesso!',
      description: 'Login realizado com sucesso.',
      color: 'success'
    })

    // Redirecionar para a página inicial
    await navigateTo('/')

  } catch (error: any) {
    authError.value = error.message || 'Erro ao fazer login'
    toast.add({
      title: 'Erro',
      description: authError.value,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Função de cadastro
const handleRegister = async (payload: FormSubmitEvent<any>) => {
  loading.value = true
  authError.value = ''

  // Validação manual
  const errors = validateRegister(payload.data)
  if (errors.length > 0) {
    authError.value = errors.join(', ')
    loading.value = false
    return
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: payload.data.email,
      password: payload.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })

    if (error) throw error

    toast.add({
      title: 'Verifique seu email',
      description: 'Enviamos um link de confirmação para seu email.',
      color: 'info'
    })

    // Alternar para modo de login após cadastro
    isLogin.value = true

  } catch (error: any) {
    authError.value = error.message || 'Erro ao criar conta'
    toast.add({
      title: 'Erro',
      description: authError.value,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Função para alternar entre login e cadastro
const toggleMode = () => {
  isLogin.value = !isLogin.value
  authError.value = ''
}
</script>

<template>
  <div class="flex flex-col items-center  min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
    <UPageCard class="w-full max-w-md">
      <!-- Abas para alternar entre Login e Cadastro -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          @click="isLogin = true"
          :class="[
            'flex-1 py-3 px-4 text-center font-medium transition-colors',
            isLogin
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          Entrar
        </button>
        <button
          @click="isLogin = false"
          :class="[
            'flex-1 py-3 px-4 text-center font-medium transition-colors',
            !isLogin
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          Cadastrar
        </button>
      </div>

      <!-- Formulário de Login -->
      <UAuthForm
        v-if="isLogin"
        :fields="loginFields"
        :submit="{ label: 'Entrar', block: true }"
        :loading="loading"
        title="Bem-vindo de volta!"
        description="Entre com suas credenciais para acessar sua conta."
        icon="i-lucide-log-in"
        @submit="handleLogin"
      >
        <template #validation>
          <UAlert
            v-if="authError"
            color="error"
            icon="i-lucide-alert-circle"
            :title="authError"
            class="mt-4"
          />
        </template>

        <template #footer>
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
            Não tem uma conta?
            <UButton
              variant="link"
              size="sm"
              @click="toggleMode"
              class="p-0 h-auto font-medium"
            >
              Cadastre-se aqui
            </UButton>
          </p>
        </template>
      </UAuthForm>

      <!-- Formulário de Cadastro -->
      <UAuthForm
        v-else
        :fields="registerFields"
        :submit="{ label: 'Criar Conta', block: true }"
        :loading="loading"
        title="Criar nova conta"
        description="Cadastre-se para acessar todas as funcionalidades."
        icon="i-lucide-user-plus"
        @submit="handleRegister"
      >
        <template #validation>
          <UAlert
            v-if="authError"
            color="error"
            icon="i-lucide-alert-circle"
            :title="authError"
            class="mt-4"
          />
        </template>

        <template #footer>
          <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
            Já tem uma conta?
            <UButton
              variant="link"
              size="sm"
              @click="toggleMode"
              class="p-0 h-auto font-medium"
            >
              Faça login aqui
            </UButton>
          </p>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
    