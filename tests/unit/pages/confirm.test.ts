import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  }
}

// Mock do toast
const mockToast = {
  add: vi.fn()
}

// Mock do router
const mockRouter = {
  push: vi.fn()
}

// Mock dos composables
vi.mock('@nuxtjs/supabase', () => ({
  useSupabaseClient: () => mockSupabase
}))

vi.mock('@nuxt/ui', () => ({
  useToast: () => mockToast
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Simulação das funções da página de confirmação
const createConfirmPage = () => {
  // Estados reativos simulados
  const loading = ref(true)
  const success = ref(false)
  const error = ref<string | null>(null)
  const timeoutId = ref<NodeJS.Timeout | null>(null)

  // Função para limpar timeout
  const clearConfirmationTimeout = () => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }

  // Verificar status da sessão atual (simula a página real)
  const checkSession = async () => {
    try {
      const { data: { user }, error: userError } = await mockSupabase.auth.getUser()

      if (userError) {
        console.error('Session error:', userError)
        return null
      }

      return { user }
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

        // Verificar se o email foi confirmado
        if (user.email_confirmed_at || user.confirmed_at) {
          success.value = true
          clearConfirmationTimeout()
          mockToast.add({
            title: 'Sucesso!',
            description: 'Seu email foi confirmado com sucesso.',
            color: 'success'
          })

          // Redirecionar para a página inicial após alguns segundos
          setTimeout(() => {
            mockRouter.push('/')
          }, 3000)
          return true
        }

        console.log('User found but email not confirmed:', {
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          confirmed_at: user.confirmed_at
        })
      } else {
        console.log('No session found')
      }

      return false
    } catch (err: unknown) {
      console.error('Error in checkEmailConfirmation:', err)
      const message = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : undefined
      error.value = message || 'Erro ao verificar confirmação'
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
        mockToast.add({
          title: 'Erro',
          description: error.value,
          color: 'error'
        })
        return
      }

      // Tentar novamente em 1 segundo
      timeoutId.value = setTimeout(checkConfirmation, 1000)
    }

    checkConfirmation()
  }

  // Simula o comportamento do onMounted da página real
  const initializeConfirmation = async () => {
    // Primeiro, tentar verificar imediatamente
    const isConfirmed = await checkEmailConfirmation()
    if (!isConfirmed) {
      // Se não conseguiu confirmar imediatamente, começar verificação periódica
      startConfirmationCheck()
    } else {
      loading.value = false
    }
  }

  return {
    loading,
    success,
    error,
    initializeConfirmation,
    startConfirmationCheck,
    checkEmailConfirmation,
    clearConfirmationTimeout
  }
}

describe('Confirm Page', () => {
  beforeEach(() => {
    // Resetar mocks antes de cada teste
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Estado inicial', () => {
    it('deve iniciar com loading true e success/error false', () => {
      const page = createConfirmPage()

      expect(page.loading.value).toBe(true)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe(null)
    })
  })


  describe('Confirmação de email bem-sucedida', () => {
    it('deve confirmar email com sucesso quando usuário está autenticado e email confirmado', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const page = createConfirmPage()

      // Executar confirmação (simula onMounted)
      await page.initializeConfirmation()

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(true)
      expect(page.error.value).toBe(null)

      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Sucesso!',
        description: 'Seu email foi confirmado com sucesso.',
        color: 'success'
      })
    })

    it('deve redirecionar para home após 3 segundos quando confirmação é bem-sucedida', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const page = createConfirmPage()

      // Executar confirmação (simula onMounted)
      await page.initializeConfirmation()

      // Avançar 3 segundos
      vi.advanceTimersByTime(3000)

      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('Falha na confirmação de email', () => {
    it('deve mostrar erro quando getUser falha', async () => {
      const errorMessage = 'Invalid token'
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage }
      })

      const page = createConfirmPage()

      // Executar confirmação - simular várias tentativas até timeout
      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar tempo suficiente para timeout (30 segundos = 30 tentativas de 1 segundo cada)
      // Cada tentativa: 1 segundo
      // Timeout após 30 tentativas = 30 segundos
      vi.advanceTimersByTime(30000)

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe('Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.')

      expect(mockToast.add).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.',
        color: 'red'
      })
    })

    it('deve mostrar erro quando usuário não tem email confirmado', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const page = createConfirmPage()

      // Executar confirmação - simular várias tentativas até timeout
      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar tempo suficiente para timeout (30 segundos)
      vi.advanceTimersByTime(30000)

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe('Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.')
    })

    it('deve mostrar erro genérico quando não há usuário', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const page = createConfirmPage()

      // Executar confirmação - simular várias tentativas até timeout
      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar tempo suficiente para timeout (30 segundos)
      vi.advanceTimersByTime(30000)

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe('Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.')
    })
  })

  describe('Verificação periódica de confirmação', () => {
    it('deve tentar verificar confirmação periodicamente até conseguir', async () => {
      // Primeiro retorna usuário sem confirmação
      mockSupabase.auth.getUser
        .mockResolvedValueOnce({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_confirmed_at: null
            }
          },
          error: null
        })
        // Depois retorna usuário confirmado
        .mockResolvedValueOnce({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_confirmed_at: '2024-01-01T00:00:00Z'
            }
          },
          error: null
        })

      const page = createConfirmPage()

      // Iniciar verificação periódica
      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar 1 segundo para primeira verificação (ainda não confirmado)
      vi.advanceTimersByTime(1000)
      expect(page.loading.value).toBe(true) // Ainda carregando

      // Avançar mais 1 segundo para segunda verificação (agora confirmado)
      vi.advanceTimersByTime(1000)

      expect(page.loading.value).toBe(false) // Deve ter parado de carregar
      expect(page.success.value).toBe(true) // Deve ter tido sucesso
    })

    it('deve definir loading enquanto verifica periodicamente', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null
          }
        },
        error: null
      })

      const page = createConfirmPage()

      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar tempo suficiente para timeout (30 segundos)
      vi.advanceTimersByTime(30000)

      expect(page.loading.value).toBe(false)
    })
  })

  describe('Estados e comportamentos', () => {
    it('deve gerenciar estados corretamente durante o processo', async () => {
      const page = createConfirmPage()

      expect(page.loading.value).toBe(true)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe(null)

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z'
          }
        },
        error: null
      })

      await page.initializeConfirmation()

      // Avançar tempo suficiente para confirmação
      vi.advanceTimersByTime(1000)

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(true)
      expect(page.error.value).toBe(null)
    })

    it('deve lidar com erros de rede', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'))

      const page = createConfirmPage()

      await page.initializeConfirmation()

      // Como não conseguiu confirmar na primeira tentativa, deve estar em modo de verificação periódica
      expect(page.loading.value).toBe(true)

      // Avançar tempo suficiente para timeout (30 segundos)
      vi.advanceTimersByTime(30000)

      expect(page.loading.value).toBe(false)
      expect(page.success.value).toBe(false)
      expect(page.error.value).toBe('Tempo limite excedido. Verifique se clicou no link correto do email ou tente fazer login novamente.')
    })
  })
})
