<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

// Tipos para os dados dos formulários
interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

const supabase = useSupabaseClient()
const toast = useToast()

// Estado para alternar entre login e cadastro
const isLogin = ref(true)

// Estado de loading
const loading = ref(false)

// Estado de erro
const authError = ref<string>('')

// Função de validação para login
const validateLogin = (data: LoginData) => {
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
const validateRegister = (data: RegisterData) => {
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
const handleLogin = async (payload: FormSubmitEvent<LoginData>) => {
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

    // Aguardar um pequeno delay para garantir que a sessão seja estabelecida
    await new Promise(resolve => setTimeout(resolve, 100))

    toast.add({
      title: 'Sucesso!',
      description: 'Login realizado com sucesso.',
      color: 'success'
    })

    // Redirecionar para a página inicial imediatamente
    await navigateTo('/', { replace: true })
  } catch (error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined
    authError.value = message || 'Erro ao fazer login'
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
const handleRegister = async (payload: FormSubmitEvent<RegisterData>) => {
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
  } catch (error: unknown) {
    const message = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined
    authError.value = message || 'Erro ao criar conta'
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

// Dados dos cards de qualidades do serviço
const serviceQualities = [
  {
    icon: 'i-lucide-rocket',
    title: 'Performance Superior',
    description: 'Tecnologia de ponta que garante velocidade e eficiência em todas as operações.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Equipe Especializada',
    description: 'Profissionais qualificados prontos para oferecer o melhor suporte e orientação.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Segurança Total',
    description: 'Seus dados protegidos com os mais altos padrões de segurança e criptografia.'
  },
  {
    icon: 'i-lucide-trending-up',
    title: 'Crescimento Garantido',
    description: 'Resultados comprovados que impulsionam seu negócio para o próximo nível.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Container principal com grid responsivo -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <!-- Coluna da esquerda - Texto chamativo -->
        <div class="order-2 lg:order-1 text-center lg:text-left">
          <div class="max-w-lg mx-auto lg:mx-0">
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 cursor-default">
              Transforme seu
              <span class="text-primary hover:drop-shadow-primary/50 hover:drop-shadow-lg duration-200 ">dia a dia</span>
            </h1>

            <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Descubra como nossa plataforma pode revolucionar sua rotina,
              automatizando processos, aumentando sua produtividade e
              dando mais tempo para o que realmente importa.
            </p>

            <div class="space-y-4">
              <div class="flex items-center justify-center lg:justify-start">
                <UIcon
                  name="i-lucide-zap"
                  class="w-6 h-6 text-primary mr-3"
                />
                <span class="text-gray-700 dark:text-gray-300">Resultados em minutos</span>
              </div>

              <div class="flex items-center justify-center lg:justify-start">
                <UIcon
                  name="i-lucide-trending-up"
                  class="w-6 h-6 text-primary mr-3"
                />
                <span class="text-gray-700 dark:text-gray-300">Cresça exponencialmente</span>
              </div>

              <div class="flex items-center justify-center lg:justify-start">
                <UIcon
                  name="i-lucide-shield"
                  class="w-6 h-6 text-primary mr-3"
                />
                <span class="text-gray-700 dark:text-gray-300">Segurança e confiabilidade</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna da direita - Card de autenticação -->
        <div class="order-1 lg:order-2">
          <UPageCard class="w-full max-w-md mx-auto shadow-lg shadow-primary/20">
            <!-- Abas para alternar entre Login e Cadastro -->
            <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                :class="[
                  'flex-1 py-3 px-4 text-center font-medium transition-colors',
                  isLogin
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                ]"
                @click="isLogin = true"
              >
                Entrar
              </button>
              <button
                :class="[
                  'flex-1 py-3 px-4 text-center font-medium transition-colors',
                  !isLogin
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                ]"
                @click="isLogin = false"
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
                    class="p-0 h-auto font-medium"
                    @click="toggleMode"
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
                    class="p-0 h-auto font-medium"
                    @click="toggleMode"
                  >
                    Faça login aqui
                  </UButton>
                </p>
              </template>
            </UAuthForm>
          </UPageCard>
        </div>
      </div>

      <!-- Seção de qualidades do serviço -->
      <div class="mt-16 mb-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Por que escolher nossa plataforma?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubra os diferenciais que fazem da nossa solução a escolha ideal para seu negócio.
          </p>
        </div>

        <!-- Grid para desktop, carrossel para mobile -->
        <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="quality in serviceQualities"
            :key="quality.title"
            class="text-center hover:shadow-lg transition-shadow duration-300"
          >
            <div class="flex flex-col items-center">
              <UIcon
                :name="quality.icon"
                class="w-12 h-12 text-primary mb-4"
              />
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ quality.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {{ quality.description }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Carrossel para mobile -->
        <div class="md:hidden">
          <UCarousel
            v-slot="{ item }"
            :items="serviceQualities"
            :ui="{ item: 'basis-full' }"
            class="rounded-lg"
            arrows
            dots
          >
            <UCard class="text-center">
              <div class="flex flex-col items-center">
                <UIcon
                  :name="item.icon"
                  class="w-12 h-12 text-primary mb-4"
                />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {{ item.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {{ item.description }}
                </p>
              </div>
            </UCard>
          </UCarousel>
        </div>
      </div>
    </div>
  </div>
</template>
