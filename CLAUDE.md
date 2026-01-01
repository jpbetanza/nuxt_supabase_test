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

## 🔐 Sistema de Autenticação e Confirmação de Email

### Fluxo de Confirmação de Email

O projeto utiliza o sistema de autenticação do **Supabase** com confirmação de email obrigatória. O fluxo funciona da seguinte forma:

#### 1. **Cadastro de Usuário**
```typescript
// Na página de login (login.vue)
const { error } = await supabase.auth.signUp({
  email: payload.data.email,
  password: payload.data.password,
  options: {
    emailRedirectTo: `${window.location.origin}/confirm` // URL de redirecionamento obrigatória
  }
})
```

#### 2. **Envio de Email de Confirmação**
- Supabase envia automaticamente um email com link de confirmação
- O link contém tokens temporários na URL (access_token, refresh_token, type)
- **IMPORTANTE:** Em desenvolvimento, os emails podem não ser enviados automaticamente

#### 3. **Página de Confirmação (`/confirm`)**
```typescript
// Verifica automaticamente se há erros na URL
const checkForUrlErrors = () => {
  const hash = window.location.hash
  if (hash.includes('error=')) {
    // Trata links expirados ou inválidos
    // Ex: #error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
  }
}

// Verifica periodicamente se o usuário foi confirmado
const startConfirmationCheck = () => {
  // Polling por até 30 segundos para detectar confirmação automática
  // Verifica getSession() e campos email_confirmed_at/confirmed_at
}
```

### Configuração Obrigatória no Supabase Dashboard

#### **Site URL**
- **Localização:** Authentication → Settings → Site URL
- **Valor desenvolvimento:** `http://localhost:3000`
- **Valor produção:** `https://seudominio.com`

#### **Redirect URLs**
- **Localização:** Authentication → Settings → Redirect URLs
- **URLs obrigatórias:**
  - `http://localhost:3000/confirm` (desenvolvimento)
  - `https://seudominio.com/confirm` (produção)

#### **Email Templates**
- **Localização:** Authentication → Email Templates
- **Importante:** Verificar se os templates estão ativos
- **SMTP:** Configurar se usar SMTP customizado

### Problemas Comuns e Soluções

#### **1. Link Expirado (`otp_expired`)**
**Sintomas:**
- URL contém: `#error=access_denied&error_code=otp_expired`
- Mensagem: "Email link is invalid or has expired"

**Soluções:**
- Solicitar novo link via `supabase.auth.resend()`
- Verificar configuração de expiração no Supabase Dashboard
- Orientar usuário a verificar caixa de spam

#### **2. Sessão Não Encontrada**
**Sintomas:**
- Log: "No session found"
- Confirmação falha mesmo com link válido

**Soluções:**
- Verificar se o usuário existe no banco de dados
- Verificar campos `email_confirmed_at` ou `confirmed_at`
- Usar `getSession()` ao invés de apenas `getUser()`
- Implementar polling para detectar mudanças assíncronas

#### **3. Emails Não Enviados em Desenvolvimento**
**Sintomas:**
- Usuário criado no banco, mas nenhum email recebido

**Soluções:**
- **Método 1:** Usar Supabase Dashboard para enviar confirmação manual
  1. Ir para Authentication → Users
  2. Encontrar o usuário
  3. Clicar "Send email confirmation"

- **Método 2:** Configurar SMTP local (recomendado para desenvolvimento)
- **Método 3:** Usar CLI do Supabase para testar emails

#### **4. Erro "process.dev"**
**Sintomas:**
- Erro: `Cannot read properties of undefined (reading 'dev')`

**Solução:**
```typescript
// ❌ Errado (Nuxt 2)
const isDev = process.dev

// ✅ Correto (Nuxt 3)
const isDev = import.meta.env.DEV
```

### Debugging e Monitoramento

#### **Logs Essenciais**
```typescript
// Em confirm.vue - logs de debug
console.log('URL:', window.location.href)
console.log('Hash:', window.location.hash)
console.log('Search:', window.location.search)

// Verificar sessão atual
const { data: { session }, error } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('User confirmed:', session?.user.email_confirmed_at || session?.user.confirmed_at)
```

#### **Console do Browser**
- Abrir F12 → Console durante o processo de confirmação
- Verificar logs de erro e informações de debug
- Monitorar chamadas de rede para `/auth/v1/verify`

#### **Supabase Dashboard**
- **Users:** Verificar status de confirmação dos usuários
- **Logs:** Verificar tentativas de autenticação
- **Auth Settings:** Confirmar configurações de URL e redirects

### Melhores Práticas

#### **1. Tratamento de Erros Robusto**
```typescript
// Sempre verificar múltiplos campos de confirmação
const isConfirmed = user.email_confirmed_at || user.confirmed_at

// Tratar links expirados graciosamente
if (url.includes('otp_expired')) {
  // Mostrar opção de reenvio
}
```

#### **2. UX Considerada**
- Loading states durante verificação
- Mensagens claras sobre o status
- Opções de retry e reenvio
- Debug info em modo desenvolvimento

#### **3. Segurança**
- Nunca logar tokens de autenticação
- Verificar validade dos links antes de processar
- Implementar timeouts para polling
- Limpar timers adequadamente

#### **4. Configuração de Ambiente**
```bash
# .env (desenvolvimento)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Verificar se as variáveis estão carregadas
console.log('Supabase URL:', useRuntimeConfig().public.supabase.url)
```

### Checklist de Implementação

#### **Para Novas Funcionalidades de Auth:**
- [ ] Configurar Site URL no Supabase Dashboard
- [ ] Adicionar Redirect URLs necessárias
- [ ] Testar fluxo completo de cadastro → confirmação
- [ ] Verificar tratamento de links expirados
- [ ] Implementar logs de debug apropriados
- [ ] Testar em diferentes navegadores
- [ ] Verificar funcionamento em produção

#### **Debugging de Problemas:**
- [ ] Verificar console do browser por erros
- [ ] Checar Supabase Dashboard por status do usuário
- [ ] Testar envio manual de confirmação
- [ ] Verificar configurações de URL no dashboard
- [ ] Confirmar variáveis de ambiente

---

**Autenticação Supabase:** Sistema crítico que requer configuração cuidadosa no dashboard e tratamento robusto de erros. Sempre teste o fluxo completo e tenha opções de fallback para links expirados.

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

## 🔍 SEO (Search Engine Optimization)

### Princípios Básicos de SEO

**SEO Genérico** visa otimizar a aplicação para motores de busca de forma independente do produto específico, utilizando boas práticas universais que se aplicam a qualquer SaaS ou plataforma digital.

#### 1. **Meta Tags Essenciais**
```typescript
// app.vue - Meta tags globais
useSeoMeta({
  title: 'Plataforma SaaS - Soluções Empresariais Completas',
  description: 'Transforme seu negócio com nossa plataforma completa. Automatize processos, aumente produtividade e impulsione resultados. Soluções empresariais inovadoras.',
  keywords: 'plataforma saas, soluções empresariais, automação, produtividade, gestão empresarial, transformação digital',
  ogTitle: 'Plataforma SaaS - Soluções Empresariais Completas',
  ogDescription: 'Descubra como nossa plataforma pode revolucionar seu negócio. Automatize processos e aumente sua produtividade.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Plataforma SaaS - Transforme seu Negócio',
  twitterDescription: 'Soluções empresariais completas para automatizar processos e aumentar produtividade.',
  author: 'Plataforma SaaS'
})
```

#### 2. **Estrutura de URLs Amigáveis**
```typescript
// pages/dashboard.vue
definePageMeta({
  title: 'Dashboard - Visão Geral do Sistema',
  description: 'Acompanhe métricas importantes, gerencie projetos e visualize relatórios em tempo real.',
})

// Resultado: /dashboard
// Meta title: "Dashboard - Visão Geral do Sistema | Plataforma SaaS"
```

#### 3. **Headings Hierárquicos**
```vue
<template>
  <div>
    <h1>Transforme seu Negócio com Nossa Plataforma</h1>
    <h2>Funcionalidades Principais</h2>
    <h3>Dashboard Interativo</h3>
    <h3>Relatórios Avançados</h3>
    <h2>Vantagens Competitivas</h2>
    <h3>Performance Superior</h3>
    <h3>Segurança Avançada</h3>
  </div>
</template>
```

### Como o Nuxt Otimiza SEO

#### **Server-Side Rendering (SSR)**
O Nuxt 4 renderiza páginas no servidor por padrão, garantindo que:
- ✅ **Conteúdo indexável**: Motores de busca veem HTML completo
- ✅ **Velocidade inicial**: First Contentful Paint mais rápido
- ✅ **SEO crawler-friendly**: Bots conseguem indexar facilmente

#### **Meta Tags Automáticas**
```typescript
// Nuxt gera automaticamente:
<title>Plataforma SaaS - Soluções Empresariais Completas</title>
<meta name="description" content="Transforme seu negócio...">
<meta property="og:title" content="Plataforma SaaS...">
<link rel="canonical" href="https://seudominio.com/pagina">
```

#### **Route-Based Meta**
```typescript
// pages/solutions.vue
definePageMeta({
  title: 'Soluções Empresariais - Plataforma SaaS',
  description: 'Descubra nossas soluções completas para otimizar processos empresariais.',
  keywords: ['soluções empresariais', 'otimização processos', 'automação empresarial']
})
```

### Palavras-Chave Estratégicas

#### **Primárias (High-Volume)**
- plataforma saas
- soluções empresariais
- automação processos
- gestão empresarial
- transformação digital

#### **Secundárias (Long-Tail)**
- como automatizar processos empresariais
- soluções para aumentar produtividade
- plataforma de gestão empresarial
- transformação digital empresas
- ferramentas para otimização de processos

#### **Técnicas de Otimização**
```vue
<template>
  <!-- ✅ Bom: Keywords naturais no conteúdo -->
  <p>Nossa <strong>plataforma SaaS</strong> oferece <strong>soluções empresariais</strong>
  completas para <strong>automação de processos</strong> e <strong>gestão empresarial</strong>.</p>

  <!-- ✅ Bom: URLs descritivas -->
  <NuxtLink to="/solutions/automacao-processos">
    Automação de Processos
  </NuxtLink>

  <!-- ✅ Bom: Alt texts descritivos -->
  <img src="/dashboard-preview.png" alt="Dashboard da plataforma com métricas e gráficos interativos">
</template>
```

### Performance e Core Web Vitals

#### **Largest Contentful Paint (LCP)**
```typescript
// Otimização de imagens
<template>
  <NuxtImg
    src="/hero-image.jpg"
    alt="Plataforma SaaS em ação"
    width="1200"
    height="600"
    loading="eager"
    format="webp"
  />
</template>
```

#### **First Input Delay (FID)**
```typescript
// Carregamento lazy de componentes
<template>
  <div>
    <HeroSection />
    <LazyFeaturesSection />
    <LazyTestimonialsSection />
  </div>
</template>
```

#### **Cumulative Layout Shift (CLS)**
```typescript
// Reserve espaço para imagens
<template>
  <div class="aspect-video bg-gray-100 rounded-lg">
    <NuxtImg
      src="/video-thumbnail.jpg"
      alt="Demonstração da plataforma"
      class="w-full h-full object-cover rounded-lg"
    />
  </div>
</template>
```

### Técnicas Avançadas de SEO

#### **1. Schema.org Structured Data**
```typescript
// pages/index.vue
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Plataforma SaaS',
  description: 'Soluções empresariais completas para automação e gestão',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'BRL',
    price: '0',
    description: 'Plano gratuito disponível'
  }
})
```

#### **2. Sitemap Dinâmico**
```typescript
// server/api/sitemap.xml.ts
export default defineSitemapEventHandler(async () => {
  const posts = await $fetch('/api/posts')

  return posts.map(post => ({
    loc: `/posts/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
    priority: 0.8
  }))
})
```

#### **3. Robots.txt Otimizado**
```typescript
// public/robots.txt
User-agent: *
Allow: /

# Bloquear páginas admin
Disallow: /admin
Disallow: /api/private

# Sitemap
Sitemap: https://seudominio.com/sitemap.xml
```

#### **4. Breadcrumbs Estruturados**
```vue
<template>
  <nav aria-label="Breadcrumb" class="flex mb-6">
    <ol class="flex items-center space-x-2">
      <li>
        <NuxtLink to="/" class="text-primary hover:underline">Início</NuxtLink>
      </li>
      <li class="text-gray-500">/</li>
      <li>
        <NuxtLink to="/solutions" class="text-primary hover:underline">Soluções</NuxtLink>
      </li>
      <li class="text-gray-500">/</li>
      <li class="text-gray-900 font-medium" aria-current="page">Automação</li>
    </ol>
  </nav>
</template>
```

### Monitoramento e Analytics

#### **Google Search Console**
- ✅ **Indexação**: Monitore quais páginas estão indexadas
- ✅ **Performance**: Acompanhe posições e cliques
- ✅ **Rich Results**: Teste structured data
- ✅ **Mobile Usability**: Verifique compatibilidade mobile

#### **Core Web Vitals Tracking**
```typescript
// plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  // Google Analytics 4
  // Monitoramento de Core Web Vitals
})
```

### Checklist de SEO por Página

#### **Obrigatório**
- [ ] Title tag único e descritivo (< 60 caracteres)
- [ ] Meta description atraente (< 160 caracteres)
- [ ] URL amigável (usar hífens, não underscores)
- [ ] Heading principal (H1) único
- [ ] Conteúdo relevante com keywords naturais
- [ ] Imagens com alt text descritivo
- [ ] Link canônico quando necessário

#### **Recomendado**
- [ ] Structured data (Schema.org)
- [ ] Open Graph tags para redes sociais
- [ ] Twitter Cards
- [ ] Sitemap submission
- [ ] Internal linking estratégico
- [ ] External links para autoridade

#### **Avançado**
- [ ] Page Speed Insights otimizado
- [ ] Mobile-first design
- [ ] HTTPS obrigatório
- [ ] Lazy loading implementado
- [ ] CDN para assets estáticos

### SEO Local e Internacional

#### **Hreflang para Multi-idioma**
```typescript
// Para sites multi-idioma
definePageMeta({
  alternates: {
    'pt-BR': '/soluções',
    'en-US': '/solutions',
    'es-ES': '/soluciones'
  }
})
```

#### **SEO Local**
```typescript
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Plataforma SaaS',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BR',
    addressRegion: 'SP',
    addressLocality: 'São Paulo'
  }
})
```

---

**SEO Genérico**: Implemente essas práticas independente do produto específico. Elas garantem boa indexação e posicionamento orgânico nos motores de busca.

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

## 🔍 ESLint e Regras de Formatação

### Configuração do ESLint
Este projeto utiliza **@nuxt/eslint** com regras específicas para Vue.js e TypeScript. O ESLint é configurado automaticamente pelo Nuxt e inclui regras para:

- **Sintaxe TypeScript**: Verificação de tipos e melhores práticas
- **Regras Vue**: Formatação adequada de templates Vue
- **Estilo de código**: Consistência na formatação

### Regras Essenciais Vue

#### 1. `vue/multiline-html-element-content-newline`
**Regra**: Controla quebras de linha em elementos HTML multilinha.

**Correto**:
```vue
<!-- ✅ Uma quebra de linha após tag de abertura -->
<div class="container">
  <p>Conteúdo</p>
</div>

<!-- ✅ Uma quebra de linha antes de tag de fechamento -->
<div class="container">
  <p>Conteúdo</p>
</div>
```

**Incorreto**:
```vue
<!-- ❌ Múltiplas quebras de linha -->
<div class="container">

  <p>Conteúdo</p>
</div>
```

#### 2. `vue/max-attributes-per-line`
**Regra**: Controla o posicionamento de atributos em elementos HTML.

**Correto**:
```vue
<!-- ✅ Atributos em linhas separadas quando há múltiplos -->
<UIcon
  name="i-lucide-zap"
  class="w-6 h-6 text-primary mr-3"
/>

<!-- ✅ Atributo único na mesma linha -->
<div class="container">
```

**Incorreto**:
```vue
<!-- ❌ Atributo class na mesma linha com outros -->
<UIcon name="i-lucide-zap" class="w-6 h-6 text-primary mr-3" />
```

### Comandos ESLint

```bash
# Verificar todos os arquivos
pnpm lint

# Corrigir automaticamente erros corrigíveis
pnpm lint -- --fix

# Verificar arquivo específico
node_modules/.bin/eslint app/pages/login.vue

# Corrigir arquivo específico
node_modules/.bin/eslint --fix app/pages/login.vue
```

### Boas Práticas de Formatação

#### Estrutura de Componentes Vue
```vue
<script setup lang="ts">
// ✅ Imports organizados
import type { FormSubmitEvent } from '@nuxt/ui'

// ✅ Tipos definidos claramente
interface UserData {
  email: string
  password: string
}

// ✅ Lógica organizada
const handleSubmit = async (payload: FormSubmitEvent<UserData>) => {
  // Implementação
}
</script>

<template>
  <!-- ✅ Estrutura HTML limpa -->
  <UPage>
    <UPageHero title="Título" />

    <UPageSection>
      <!-- ✅ Componentes UIcon com atributos formatados -->
      <UIcon
        name="i-lucide-zap"
        class="w-6 h-6 text-primary mr-3"
      />
    </UPageSection>
  </UPage>
</template>
```

#### Prevenção de Erros Comuns
- ✅ Sempre execute `pnpm lint` antes de commitar
- ✅ Use `--fix` para correções automáticas quando possível
- ✅ Mantenha atributos de componentes em linhas separadas
- ✅ Evite quebras de linha extras em elementos HTML
- ✅ Execute testes após correções de linting

### Integração com CI/CD
O ESLint é executado automaticamente nos pipelines de CI/CD. Para passar nos testes:

1. ✅ Corrija todos os erros marcados como "error"
2. ✅ Considere corrigir warnings (marcados como "warning")
3. ✅ Execute `pnpm lint` localmente antes de fazer push

---

**ESLint**: Ferramenta essencial para manter qualidade e consistência do código. Sempre execute linting antes de commits e pushes.

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
17. **Nunca delete o arquivo .env local** - O arquivo `.env` contém variáveis de ambiente específicas do ambiente de desenvolvimento local. Este arquivo não deve ser removido ou modificado sem necessidade absoluta.
18. **Sempre execute testes após mudanças em YAML ou Dockerfile** - Modificações em workflows GitHub Actions, Dockerfiles ou arquivos de configuração de infraestrutura podem quebrar builds e deploys. Execute testes locais e valide a sintaxe antes de commitar.

### Testes Após Modificações em Arquivos de Infraestrutura

#### Workflows GitHub Actions (.github/workflows/*.yml)
```bash
# Verificar sintaxe do workflow (opcional - GitHub valida automaticamente)
# Fazer push para branch de teste e verificar se o workflow executa
git push origin feature/nova-feature:test-branch

# Monitorar execução no GitHub Actions
# Verificar se jobs executam na ordem correta
# Validar se artifacts são criados e transferidos entre jobs
```

#### Dockerfile
```bash
# Testar build local
docker build -t test-image .

# Verificar se container inicia corretamente
docker run --rm test-image

# Validar se aplicação funciona dentro do container
docker run -p 3000:3000 test-image

# Limpar imagens de teste
docker rmi test-image
```

#### Arquivos de Configuração
```bash
# Validar sintaxe YAML
yamllint .github/workflows/*.yml

# Verificar se variáveis de ambiente estão definidas
# Testar configurações em ambiente local antes do deploy
```

---

**Última atualização:** Dezembro 2025
**Mantenedor:** AI Development Guide
