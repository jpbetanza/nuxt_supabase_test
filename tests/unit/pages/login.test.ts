import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'

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

// Mock do Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn()
  }
}

// Mock do toast
const mockToast = {
  add: vi.fn()
}

// Mock da navegação
const mockNavigateTo = vi.fn()

// Mock dos composables
vi.mock('@nuxtjs/supabase', () => ({
  useSupabaseClient: () => mockSupabase
}))

vi.mock('@nuxt/ui', () => ({
  useToast: () => mockToast
}))

vi.mock('nuxt/app', () => ({
  navigateTo: mockNavigateTo
}))

// Simulação das funções da página de login
const createLoginPage = () => {
  // Estado reativo simulado
  const isLogin = ref(true)
  const loading = ref(false)
  const authError = ref('')

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
      const { error } = await mockSupabase.auth.signInWithPassword({
        email: payload.data.email,
        password: payload.data.password
      })

      if (error) throw error

      mockToast.add({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
        color: 'success'
      })

      // Aguardar um pequeno delay para garantir que a sessão seja estabelecida
      await new Promise(resolve => setTimeout(resolve, 100))

      mockToast.add({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
        color: 'success'
      })

      // Redirecionar para a página inicial imediatamente
      mockNavigateTo('/', { replace: true })
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined
      authError.value = message || 'Erro ao fazer login'
      mockToast.add({
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
      const { error } = await mockSupabase.auth.signUp({
        email: payload.data.email,
        password: payload.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      })

      if (error) throw error

      mockToast.add({
        title: 'Verifique seu email',
        description: 'Enviamos um link de confirmação para seu email.',
        color: 'info'
      })

      // Alternar para modo de login após cadastro
      isLogin.value = true
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : undefined
      authError.value = message || 'Erro ao criar conta'
      mockToast.add({
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

  return {
    isLogin,
    loading,
    authError,
    validateLogin,
    validateRegister,
    handleLogin,
    handleRegister,
    toggleMode
  }
}

describe('Login Page', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve iniciar no modo de login', () => {
      const page = createLoginPage()

      expect(page.isLogin.value).toBe(true)
      expect(page.loading.value).toBe(false)
      expect(page.authError.value).toBe('')
    })
  })

  describe('Alternância entre modos', () => {
    it('deve alternar para modo de cadastro quando executar toggleMode', () => {
      const page = createLoginPage()

      expect(page.isLogin.value).toBe(true)

      page.toggleMode()

      expect(page.isLogin.value).toBe(false)
    })

    it('deve limpar erro ao alternar entre modos', () => {
      const page = createLoginPage()

      // Simular erro
      page.authError.value = 'Erro de teste'
      expect(page.authError.value).toBe('Erro de teste')

      // Alternar modo
      page.toggleMode()
      expect(page.authError.value).toBe('')
    })
  })

  describe('Validação de formulário', () => {
    describe('Validação de login', () => {
      it('deve validar email obrigatório', () => {
        const page = createLoginPage()

        const errors = page.validateLogin({ password: '123456' })
        expect(errors).toContain('Email inválido')
      })

      it('deve validar formato de email', () => {
        const page = createLoginPage()

        const errors = page.validateLogin({ email: 'invalid-email', password: '123456' })
        expect(errors).toContain('Email inválido')
      })

      it('deve validar senha com mínimo 6 caracteres', () => {
        const page = createLoginPage()

        const errors = page.validateLogin({ email: 'test@example.com', password: '123' })
        expect(errors).toContain('A senha deve ter pelo menos 6 caracteres')
      })

      it('deve passar validação com dados corretos', () => {
        const page = createLoginPage()

        const errors = page.validateLogin({ email: 'test@example.com', password: '123456' })
        expect(errors).toHaveLength(0)
      })
    })

    describe('Validação de cadastro', () => {
      it('deve validar email obrigatório', () => {
        const page = createLoginPage()

        const errors = page.validateRegister({ password: '123456', confirmPassword: '123456' })
        expect(errors).toContain('Email inválido')
      })

      it('deve validar senha com mínimo 6 caracteres', () => {
        const page = createLoginPage()

        const errors = page.validateRegister({
          email: 'test@example.com',
          password: '123',
          confirmPassword: '123'
        })
        expect(errors).toContain('A senha deve ter pelo menos 6 caracteres')
      })

      it('deve validar confirmação de senha', () => {
        const page = createLoginPage()

        const errors = page.validateRegister({
          email: 'test@example.com',
          password: '123456',
          confirmPassword: '654321'
        })
        expect(errors).toContain('As senhas não coincidem')
      })

      it('deve passar validação com dados corretos', () => {
        const page = createLoginPage()

        const errors = page.validateRegister({
          email: 'test@example.com',
          password: '123456',
          confirmPassword: '123456'
        })
        expect(errors).toHaveLength(0)
      })
    })
  })

  describe('Login', () => {
    it('deve fazer login com sucesso e redirecionar', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

      const page = createLoginPage()

      const loginData = { email: 'test@example.com', password: '123456' }
      await page.handleLogin({ data: loginData })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(loginData)
      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
        color: 'success'
      })
      expect(mockNavigateTo).toHaveBeenCalledWith('/', { replace: true })
    })

    it('deve mostrar erro quando login falha', async () => {
      const errorMessage = 'Invalid credentials'
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: errorMessage }
      })

      const page = createLoginPage()

      const loginData = { email: 'test@example.com', password: 'wrongpassword' }
      await page.handleLogin({ data: loginData })

      expect(page.authError.value).toBe(errorMessage)
      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Erro',
        description: errorMessage,
        color: 'error'
      })
    })

    it('deve definir loading durante o login', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      const page = createLoginPage()

      const loginPromise = page.handleLogin({
        data: { email: 'test@example.com', password: '123456' }
      })

      expect(page.loading.value).toBe(true)

      await loginPromise

      expect(page.loading.value).toBe(false)
    })

    it('deve bloquear submissão quando validação falha', async () => {
      const page = createLoginPage()

      const invalidData = { email: 'invalid-email', password: '123' }
      await page.handleLogin({ data: invalidData })

      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
      expect(page.authError.value).toBe('Email inválido, A senha deve ter pelo menos 6 caracteres')
    })
  })

  describe('Cadastro', () => {
    it('deve cadastrar usuário com sucesso', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null })

      const page = createLoginPage()

      // Mudar para modo cadastro
      page.isLogin.value = false

      const registerData = {
        email: 'newuser@example.com',
        password: '123456',
        confirmPassword: '123456'
      }
      await page.handleRegister({ data: registerData })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`
        }
      })
      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Verifique seu email',
        description: 'Enviamos um link de confirmação para seu email.',
        color: 'info'
      })
      expect(page.isLogin.value).toBe(true) // Deve voltar para modo login
    })

    it('deve mostrar erro quando cadastro falha', async () => {
      const errorMessage = 'Email already registered'
      mockSupabase.auth.signUp.mockResolvedValue({
        error: { message: errorMessage }
      })

      const page = createLoginPage()

      page.isLogin.value = false

      const registerData = {
        email: 'existing@example.com',
        password: '123456',
        confirmPassword: '123456'
      }
      await page.handleRegister({ data: registerData })

      expect(page.authError.value).toBe(errorMessage)
      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Erro',
        description: errorMessage,
        color: 'error'
      })
    })

    it('deve definir loading durante o cadastro', async () => {
      mockSupabase.auth.signUp.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      const page = createLoginPage()

      page.isLogin.value = false

      const registerPromise = page.handleRegister({
        data: {
          email: 'newuser@example.com',
          password: '123456',
          confirmPassword: '123456'
        }
      })

      expect(page.loading.value).toBe(true)

      await registerPromise

      expect(page.loading.value).toBe(false)
    })

    it('deve bloquear submissão quando validação falha', async () => {
      const page = createLoginPage()

      page.isLogin.value = false

      const invalidData = {
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      }
      await page.handleRegister({ data: invalidData })

      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
      expect(page.authError.value).toContain('Email inválido')
      expect(page.authError.value).toContain('A senha deve ter pelo menos 6 caracteres')
      expect(page.authError.value).toContain('As senhas não coincidem')
    })
  })

  describe('Estados e comportamentos', () => {
    it('deve gerenciar estado de loading corretamente', async () => {
      const page = createLoginPage()

      expect(page.loading.value).toBe(false)

      mockSupabase.auth.signInWithPassword.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      const loginPromise = page.handleLogin({
        data: { email: 'test@example.com', password: '123456' }
      })

      expect(page.loading.value).toBe(true)

      await loginPromise

      expect(page.loading.value).toBe(false)
    })

    it('deve limpar erros anteriores ao iniciar nova operação', async () => {
      const page = createLoginPage()

      page.authError.value = 'Erro anterior'

      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

      await page.handleLogin({
        data: { email: 'test@example.com', password: '123456' }
      })

      expect(page.authError.value).toBe('')
    })
  })
})
