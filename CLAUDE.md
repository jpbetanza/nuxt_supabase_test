# Guia de Desenvolvimento - Nuxt.js + Nuxt UI + Supabase

Este documento serve como referência para AIs desenvolvendo novas funcionalidades neste aplicativo Nuxt.js que utiliza Nuxt UI como sistema de componentes e Supabase como banco de dados e autenticador.

## 📋 Visão Geral do Projeto

**Stack Tecnológica:**
- **Nuxt 4** - Framework Vue.js full-stack com SSR/SSG
- **Nuxt UI** - Biblioteca de componentes acessíveis e responsivos
- **Supabase** - Backend-as-a-Service (banco de dados PostgreSQL + autenticação)
- **Stripe** - Plataforma de pagamentos via módulo `@unlok-co/nuxt-stripe`
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS (integrado ao Nuxt UI)
- **ESLint** - Linting e formatação de código

**Estrutura do Projeto:**
```
app/
├── app.vue           # Layout principal da aplicação
├── app.config.ts     # Configurações do Nuxt UI
├── pages/            # Páginas da aplicação (file-based routing)
├── components/       # Componentes reutilizáveis
└── assets/css/       # Estilos customizados

nuxt.config.ts        # Configurações do Nuxt
package.json          # Dependências e scripts
```

## 🔧 Servidores MCP Disponíveis

**IMPORTANTE:** Sempre utilize os servidores MCP disponíveis para entender o comportamento dos frameworks antes de implementar qualquer funcionalidade.

### 1. MCP Supabase (`mcp_supabase_*`)
- **Uso:** Consultas ao banco de dados, autenticação, gerenciamento de projetos
- **Quando usar:**
  - Antes de implementar funcionalidades que envolvam dados
  - Para verificar estrutura de tabelas e políticas RLS
  - Para entender configurações de autenticação
  - Para executar queries e migrations

**Comandos essenciais:**
- `mcp_supabase_list_tables` - Ver estrutura das tabelas
- `mcp_supabase_execute_sql` - Executar queries SQL
- `mcp_supabase_apply_migration` - Aplicar migrations
- `mcp_supabase_get_advisors` - Verificar vulnerabilidades e performance

### 2. MCP Stripe (`mcp_stripe_*`)
- **Uso:** Documentação oficial do Stripe, integração de pagamentos, produtos Stripe
- **Quando usar:**
  - Antes de implementar funcionalidades de pagamento
  - Para entender produtos Stripe (Payments, Billing, Connect, etc.)
  - Para verificar métodos de pagamento disponíveis
  - Para consultar APIs e exemplos de implementação
  - Para entender fluxos de pagamento e melhores práticas

**Comandos essenciais:**
- `mcp_stripe_search_stripe_documentation` - Buscar documentação oficial do Stripe
- `mcp_stripe_get_stripe_account_info` - Informações da conta Stripe conectada
- `mcp_stripe_list_customers` - Listar clientes
- `mcp_stripe_list_products` - Listar produtos
- `mcp_stripe_list_prices` - Listar preços
- `mcp_stripe_list_payment_intents` - Listar intents de pagamento
- `mcp_stripe_list_subscriptions` - Listar assinaturas
- `mcp_stripe_retrieve_balance` - Ver saldo da conta

### 3. MCP Nuxt (`mcp_nuxt_*`)
- **Uso:** Documentação e guias do Nuxt
- **Quando usar:**
  - Antes de implementar novas páginas ou rotas
  - Para entender conceitos do Nuxt (SSR, composables, etc.)
  - Para verificar compatibilidade de módulos

**Comandos essenciais:**
- `mcp_nuxt_get_documentation_page` - Documentação específica
- `mcp_nuxt_list_modules` - Ver módulos disponíveis
- `mcp_nuxt_get_getting_started_guide` - Guias de início

### 3. MCP Nuxt UI (`mcp_nuxt-ui_*`)
- **Uso:** Componentes, templates e documentação do Nuxt UI
- **Quando usar:**
  - Antes de criar novos componentes
  - Para verificar props, slots e eventos de componentes
  - Para explorar templates e exemplos

**Comandos essenciais:**
- `mcp_nuxt-ui_list_components` - Listar componentes disponíveis
- `mcp_nuxt-ui_get_component` - Detalhes de um componente específico
- `mcp_nuxt-ui_list_examples` - Exemplos de implementação

## 🚀 Workflow de Desenvolvimento

### 1. Planejamento da Funcionalidade
```bash
# Sempre comece verificando os servidores MCP relevantes

# Para funcionalidades de pagamento:
1. mcp_stripe_search_stripe_documentation (consultar documentação oficial)
2. mcp_nuxt-ui_list_components (ver componentes de UI)
3. mcp_supabase_list_tables (verificar estrutura de dados)

# Para páginas gerais:
1. mcp_nuxt-ui_list_components (ver componentes de formulário)
2. mcp_supabase_list_tables (verificar estrutura de dados)
3. mcp_nuxt_get_documentation_page (entender roteamento)
```

### 2. Implementação
```typescript
// Estrutura típica de uma página
<script setup lang="ts">
// 1. Imports de composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// 2. Reatividade
const data = ref([])
const loading = ref(false)

// 3. Funções assíncronas
const fetchData = async () => {
  loading.value = true
  try {
    const { data: result, error } = await supabase
      .from('table_name')
      .select('*')
    if (error) throw error
    data.value = result
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    loading.value = false
  }
}

// 4. Lifecycle hooks
onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- 5. Template usando componentes Nuxt UI -->
  <UPage>
    <UPageHero title="Minha Página" />

    <UPageSection>
      <!-- Conteúdo da página -->
    </UPageSection>
  </UPage>
</template>
```

### 3. Padrões de Autenticação

**Verificação de usuário autenticado:**
```typescript
<script setup lang="ts">
const user = useSupabaseUser()

// Redirecionamento se não autenticado
if (!user.value) {
  await navigateTo('/login')
}
</script>
```

**Página de login típica:**
```vue
<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)

const signIn = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Erro no login:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit="signIn">
    <UFormGroup label="Email" required>
      <UInput v-model="email" type="email" />
    </UFormGroup>

    <UButton type="submit" :loading="loading">
      Entrar
    </UButton>
  </UForm>
</template>
```

## 🎨 Padrões de UI/UX

### Componentes Essenciais
- **UPage**: Container principal de páginas
- **UPageHero**: Cabeçalho de página
- **UPageSection**: Seções de conteúdo
- **UForm/UFormGroup**: Formulários
- **UTable**: Tabelas de dados
- **UButton**: Botões
- **UInput**: Campos de entrada

### Layout Responsivo
```vue
<template>
  <UPage>
    <UPageHero title="Dashboard" />

    <UPageSection>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Cards responsivos -->
      </div>
    </UPageSection>
  </UPage>
</template>
```

### Notificações (Toast)
Use o composable `useToast()` para mostrar notificações ao usuário. Sempre use as cores apropriadas:

```typescript
<script setup lang="ts">
const toast = useToast()

// ✅ Sucesso
toast.add({
  title: 'Sucesso!',
  description: 'Operação realizada com sucesso.',
  color: 'success'
})

// ✅ Erro
toast.add({
  title: 'Erro',
  description: 'Ocorreu um erro inesperado.',
  color: 'error'
})

// ✅ Informações
toast.add({
  title: 'Informação',
  description: 'Esta é uma informação importante.',
  color: 'info'
})

// ✅ Aviso
toast.add({
  title: 'Atenção',
  description: 'Verifique os dados antes de continuar.',
  color: 'warning'
})
</script>
```

**Cores válidas:** `'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'neutral'`

**❌ Não use:** `'green'`, `'red'`, `'blue'`, etc. - use sempre os valores do enum.

## 🗄️ Padrões de Banco de Dados

### Queries Supabase
```typescript
// SELECT com filtros
const { data, error } = await supabase
  .from('posts')
  .select('*, author(name, avatar)')
  .eq('published', true)
  .order('created_at', { ascending: false })

// INSERT
const { data, error } = await supabase
  .from('posts')
  .insert([{ title, content, user_id: user.value.id }])
  .select()

// UPDATE
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Novo título' })
  .eq('id', postId)

// DELETE
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### Row Level Security (RLS)
Sempre verifique as políticas RLS antes de implementar funcionalidades:
```sql
-- Exemplo de política RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);
```

## 💳 Sistema de Pagamentos - Stripe

### Módulo Nuxt Stripe
Este projeto utiliza o módulo **`@unlok-co/nuxt-stripe`** para integração com a plataforma de pagamentos Stripe.

**Documentação oficial:** [https://github.com/flozero/nuxt-stripe](https://github.com/flozero/nuxt-stripe?utm_source=nuxt.com&utm_medium=aside-module&utm_campaign=nuxt.com)

### Configuração
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@unlok-co/nuxt-stripe'],
  stripe: {
    // Server-side
    server: {
      key: process.env.STRIPE_SECRET_KEY,
      options: {
        // API options override
      },
    },
    // Client-side
    client: {
      key: process.env.STRIPE_PUBLISHABLE_KEY,
      options: {},
    },
  },
})
```

### Uso Básico

#### Server-side (API Routes)
```typescript
import { defineEventHandler } from 'h3'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event)

  // Criar Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000, // R$ 10,00 em centavos
    currency: 'brl',
    automatic_payment_methods: { enabled: true },
  })

  return {
    clientSecret: paymentIntent.client_secret,
  }
})
```

#### Client-side (Componentes Vue)
```vue
<script setup lang="ts">
const { stripe } = useClientStripe()

// Usar o Stripe para processar pagamentos
const handlePayment = async () => {
  if (stripe.value) {
    const { error } = await stripe.value.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    })

    if (error) {
      console.error('Erro no pagamento:', error)
    }
  }
}
</script>
```

### Produtos Stripe Principais

#### 1. **Payments** - Pagamentos únicos
- **Payment Intents API**: API moderna para processar pagamentos
- **Charges API**: API legada (ainda suportada)
- **Stripe Elements**: Componentes de UI para formulários de pagamento
- **Payment Links**: Links de pagamento hospedados pelo Stripe

#### 2. **Billing** - Assinaturas e recorrência
- **Subscriptions**: Cobrança recorrente automática
- **Prices**: Definição de preços e planos
- **Invoices**: Faturas automáticas
- **Customer Portal**: Portal self-service para clientes

#### 3. **Connect** - Plataformas de marketplace
- **Express Accounts**: Contas expressas para vendedores
- **Standard Accounts**: Contas padrão com painel completo
- **Application Fees**: Taxas de aplicação automática

### Variáveis de Ambiente
```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Boas Práticas Stripe

#### Segurança
- ✅ Nunca exponha chaves secretas no client-side
- ✅ Use sempre HTTPS em produção
- ✅ Implemente verificação de webhook signatures
- ✅ Armazene apenas IDs do Stripe, nunca dados completos de cartão

#### UX/UI
- ✅ Use Stripe Elements para formulários de pagamento
- ✅ Implemente loading states durante processamento
- ✅ Mostre mensagens de erro claras para o usuário
- ✅ Suporte a múltiplos métodos de pagamento

#### Backend
- ✅ Use webhooks para eventos assíncronos
- ✅ Implemente idempotency keys para evitar duplicatas
- ✅ Valide todos os dados antes de enviar para Stripe
- ✅ Monitore logs e implemente alertas

### Testes com Stripe
```typescript
// Test mode keys (sempre usar em desenvolvimento)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

// Cartões de teste
// Sucesso: 4242 4242 4242 4242
// Falha: 4000 0000 0000 0002
// Exigir autenticação: 4000 0025 0000 3155
```

### Monitoramento e Debugging
- **Stripe Dashboard**: Interface web para gerenciar transações
- **Stripe CLI**: Ferramenta de linha de comando para desenvolvimento
- **Logs**: Todos os eventos são logados automaticamente
- **Webhooks**: Receba notificações em tempo real

### Compliance e Regulamentação
- ✅ **PCI DSS**: Stripe lida com conformidade de segurança
- ✅ **SCA (Strong Customer Authentication)**: Suporte automático para Europa
- ✅ **SOX Compliance**: Adequado para empresas públicas
- ✅ **GDPR**: Conformidade com proteção de dados

## 📁 Estrutura de Arquivos

### Páginas (`app/pages/`)
- Arquivos `.vue` seguem convenção de roteamento automático
- Estrutura: `pages/users/[id].vue` → rota `/users/:id`
- Use `definePageMeta` para metadados de página

### Componentes (`app/components/`)
- Componentes globais (auto-importados)
- Nomeação: PascalCase (ex: `UserCard.vue`)
- Props tipados com TypeScript

### Composables (`app/composables/`)
- Lógica reutilizável
- Convenção: `useSomething.ts`
- Retornam objetos reativos

## 🔍 Debugging e Monitoramento

### Logs Supabase
```bash
# Verificar logs de erro
mcp_supabase_get_logs project_id api

# Verificar advisories (segurança/performance)
mcp_supabase_get_advisors project_id security
```

### Ferramentas de Desenvolvimento
- **Nuxt DevTools**: Inspeção de estado, rotas, componentes
- **Vue DevTools**: Debug de reatividade
- **Supabase Dashboard**: Gerenciamento de dados e auth

## 🚀 Deploy e Produção

### Build Commands
```bash
pnpm build    # Build para produção
pnpm preview  # Preview local do build
```

### Variáveis de Ambiente
```bash
# .env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### Otimizações
- **Route Rules**: Configure caching e rendering por rota
- **Image Optimization**: Use `@nuxt/image` para otimização automática
- **Code Splitting**: Importações dinâmicas para bundles menores

## 📚 Recursos Essenciais

### Documentação
- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Nuxt UI Docs](https://ui.nuxt.com)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://docs.stripe.com)
- [Nuxt Stripe Module](https://github.com/flozero/nuxt-stripe)

### Comunidades
- [Nuxt Discord](https://discord.nuxtjs.org)
- [Supabase Discord](https://supabase.com/discord)
- [Stripe Discord](https://stripe.com/discord)

## 🧪 Testes Unitários

**IMPORTANTE:** Toda nova funcionalidade deve incluir testes unitários utilizando `@nuxt/test-utils`. Os testes devem ser executados ao final de cada desenvolvimento para garantir a integridade do sistema.

### Configuração de Testes

**Stack de Testes:**
- **@nuxt/test-utils** - Utilitários oficiais do Nuxt para testes
- **Vitest** - Framework de testes rápido e moderno
- **@vue/test-utils** - Utilitários para testar componentes Vue
- **jsdom** - Ambiente DOM para testes

**Estrutura dos Testes:**
```
tests/
├── unit/                    # Testes unitários
│   ├── components/         # Testes de componentes
│   ├── pages/             # Testes de páginas
│   ├── composables/       # Testes de composables
│   └── utils/             # Testes de utilitários
└── e2e/                   # Testes end-to-end (futuro)

# Arquivos de configuração
vitest.config.ts           # Configuração do Vitest
test.setup.ts             # Configuração global dos testes
```

### Escrevendo Testes

#### 1. Testes de Componentes
```typescript
// tests/unit/components/UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '~/components/UserCard.vue'

describe('UserCard', () => {
  it('renders user name correctly', () => {
    const user = { name: 'João Silva', email: 'joao@example.com' }
    const wrapper = mount(UserCard, {
      props: { user }
    })

    expect(wrapper.text()).toContain('João Silva')
    expect(wrapper.text()).toContain('joao@example.com')
  })

  it('emits edit event when edit button is clicked', async () => {
    const user = { name: 'João Silva', email: 'joao@example.com' }
    const wrapper = mount(UserCard, {
      props: { user }
    })

    await wrapper.find('button[data-testid="edit-btn"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([user])
  })
})
```

#### 2. Testes de Páginas
```typescript
// tests/unit/pages/index.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

// Mock do Supabase
vi.mock('@nuxtjs/supabase', () => ({
  useSupabaseClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: 1, title: 'Test Post' }],
        error: null
      }))
    }))
  }),
  useSupabaseUser: () => ref({ id: 'user-123' })
}))

describe('Index Page', () => {
  it('loads and displays posts', async () => {
    const wrapper = await mountSuspended(IndexPage)

    expect(wrapper.text()).toContain('Test Post')
  })

  it('shows loading state initially', async () => {
    const wrapper = await mountSuspended(IndexPage)

    // Verifica se o estado de loading é exibido
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })
})
```

#### 3. Testes de Composables
```typescript
// tests/unit/composables/usePosts.test.ts
import { describe, it, expect, vi } from 'vitest'
import { usePosts } from '~/composables/usePosts'

// Mock do Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      data: [{ id: 1, title: 'Test Post' }],
      error: null
    }))
  }))
}

vi.mock('@nuxtjs/supabase', () => ({
  useSupabaseClient: () => mockSupabase
}))

describe('usePosts', () => {
  it('fetches posts successfully', async () => {
    const { posts, loading, fetchPosts } = usePosts()

    await fetchPosts()

    expect(loading.value).toBe(false)
    expect(posts.value).toEqual([{ id: 1, title: 'Test Post' }])
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
  })

  it('handles errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        data: null,
        error: { message: 'Database error' }
      }))
    })

    const { error, fetchPosts } = usePosts()

    await fetchPosts()

    expect(error.value).toBe('Database error')
  })
})
```

### Configuração do Vitest

**vitest.config.ts:**
```typescript
/// <reference types="vitest" />
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    setupFiles: ['./test.setup.ts']
  }
})
```

**test.setup.ts:**
```typescript
import { beforeAll } from 'vitest'

// Configurações globais para testes
beforeAll(() => {
  // Configurações de ambiente de teste
  process.env.NODE_ENV = 'test'
})
```

### Comandos de Teste

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage

# Executar testes de um arquivo específico
pnpm test UserCard.test.ts

# Executar testes unitários apenas
pnpm test:unit
```

### Workflow de Testes

#### Antes de Implementar
```bash
# 1. Escrever testes primeiro (TDD)
# Criar arquivo .test.ts correspondente

# 2. Executar testes (devem falhar inicialmente)
pnpm test

# 3. Implementar funcionalidade
# Escrever código até os testes passarem

# 4. Refatorar e executar testes novamente
pnpm test
```

#### Após Implementar
```bash
# 1. Executar suite completa de testes
pnpm test

# 2. Verificar cobertura de código
pnpm test:coverage

# 3. Corrigir qualquer falha identificada
# - Testes quebrados
# - Cobertura insuficiente (< 80%)
# - Regressões no sistema
```

### Boas Práticas de Testes

#### Cobertura de Código
- **Mínimo 80%** de cobertura geral
- **Componentes**: Cobrir props, eventos, estados
- **Páginas**: Cobrir carregamento, interações, roteamento
- **Composables**: Cobrir lógica de negócio, estados, erros

#### Estrutura dos Testes
```typescript
describe('Component/Page/Composable Name', () => {
  describe('when condition A', () => {
    it('should behave correctly', () => {
      // Arrange
      // Act
      // Assert
    })
  })

  describe('when condition B', () => {
    it('should handle edge case', () => {
      // Teste de caso extremo
    })
  })
})
```

#### Mocks e Stubs
- **Supabase**: Mock sempre as chamadas de API
- **Stripe**: Mock todas as chamadas de pagamento e webhooks
- **Router**: Mock navegação quando necessário
- **Componentes externos**: Usar stubs para isolamento

#### Testes de Integração vs Unitários
- **Unitários**: Testam unidades isoladas (componentes, composables)
- **Integração**: Testam fluxo completo (futuro - e2e)

#### Testes de Pagamento (Stripe)
```typescript
// Mocks essenciais para testes Stripe
vi.mock('@unlok-co/nuxt-stripe', () => ({
  useServerStripe: () => mockStripeServer,
  useClientStripe: () => ({ stripe: ref(mockStripeClient) })
}))

// Mock do Stripe Server
const mockStripeServer = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
    confirm: vi.fn()
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn()
  },
  subscriptions: {
    create: vi.fn(),
    cancel: vi.fn()
  }
}

// Mock do Stripe Client
const mockStripeClient = {
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn()
    }))
  })),
  confirmPayment: vi.fn(),
  confirmCardPayment: vi.fn()
}
```

**Cenários de teste essenciais:**
- ✅ Criação bem-sucedida de Payment Intent
- ✅ Tratamento de erros de pagamento
- ✅ Validação de webhooks
- ✅ Fluxos de assinatura
- ✅ Estados de loading durante processamento
- ✅ Mensagens de erro para usuário

## ⚠️ Boas Práticas

1. **Sempre consulte MCP servers** antes de implementar (Supabase, Stripe, Nuxt)
2. **Escreva testes** para toda nova funcionalidade
3. **Execute testes** ao final de cada desenvolvimento
4. **Use TypeScript** para tipagem forte
5. **Implemente autenticação** em funcionalidades que necessitam
6. **Verifique RLS policies** para segurança de dados
7. **Nunca exponha chaves Stripe** no client-side
8. **Use sempre HTTPS** em produção para pagamentos
9. **Implemente webhooks** para eventos Stripe assíncronos
10. **Teste responsividade** em diferentes dispositivos
11. **Use ESLint** para manter código consistente
12. **Documente composables** e componentes complexos
13. **Implemente loading states** para melhor UX
14. **Use error handling** adequado em pagamentos
15. **Otimize queries** Supabase para performance
16. **Mantenha cobertura > 80%** em todos os testes

---

**Última atualização:** Dezembro 2025
**Mantenedor:** AI Development Guide
