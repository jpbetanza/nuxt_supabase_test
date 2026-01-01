# Guia de Desenvolvimento - Nuxt.js + Nuxt UI + Supabase

Este documento serve como referência para AIs desenvolvendo novas funcionalidades neste aplicativo Nuxt.js que utiliza Nuxt UI como sistema de componentes e Supabase como banco de dados e autenticador.

## 📋 Visão Geral do Projeto

**Stack Tecnológica:**
- **Nuxt 4** - Framework Vue.js full-stack com SSR/SSG
- **Nuxt UI** - Biblioteca de componentes acessíveis e responsivos
- **Supabase** - Backend-as-a-Service (banco de dados PostgreSQL + autenticação)
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

### 2. MCP Nuxt (`mcp_nuxt_*`)
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
# Exemplo: Para uma nova página com formulário
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

### Comunidades
- [Nuxt Discord](https://discord.nuxtjs.org)
- [Supabase Discord](https://supabase.com/discord)

## ⚠️ Boas Práticas

1. **Sempre consulte MCP servers** antes de implementar
2. **Use TypeScript** para tipagem forte
3. **Implemente autenticação** em funcionalidades que necessitam
4. **Verifique RLS policies** para segurança de dados
5. **Teste responsividade** em diferentes dispositivos
6. **Use ESLint** para manter código consistente
7. **Documente composables** e componentes complexos
8. **Implemente loading states** para melhor UX
9. **Use error handling** adequado
10. **Otimize queries** Supabase para performance

---

**Última atualização:** Dezembro 2025
**Mantenedor:** AI Development Guide
