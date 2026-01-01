import { beforeAll } from 'vitest'

// Configurações globais para testes
beforeAll(() => {
  // Configurações de ambiente de teste
  process.env.NODE_ENV = 'test'
})
