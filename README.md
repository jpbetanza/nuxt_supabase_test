# Nuxt Starter Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to get started with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://starter-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://starter-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Nuxt Starter Template" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
  </picture>
</a>

> The starter template for Vue is on https://github.com/nuxt-ui-templates/starter-vue.

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Setup

Make sure to install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## CI/CD e Docker

Este projeto inclui configuração completa de CI/CD com GitHub Actions para deploy automatizado no Docker Hub.

### Workflows Disponíveis

#### 🚀 Deploy Homologação (`deploy-homologacao.yml`)
- **Trigger**: Push nas branches `staging` ou `develop`
- **Funcionalidades**:
  - ✅ Testes unitários com cobertura
  - ✅ Type checking
  - ✅ Linting (ESLint)
  - ✅ Build da aplicação
  - ✅ Build e push da imagem Docker
  - ✅ Suporte multi-plataforma (AMD64/ARM64)
  - ✅ Cache de build para otimização

**Tags geradas**: `staging-latest`, `homologacao`, `staging-<commit-sha>`

#### 🎯 Deploy Produção (`deploy-production.yml`)
- **Trigger**: Push na branch `main` ou manual via workflow_dispatch
- **Funcionalidades**:
  - ✅ Todos os testes do workflow de homologação
  - ✅ Scan de vulnerabilidades (Trivy)
  - ✅ Build e push da imagem Docker
  - ✅ Attestation de build (segurança)
  - ✅ SBOM (Software Bill of Materials)
  - ✅ Criação automática de GitHub Release (opcional)
  - ✅ Suporte multi-plataforma (AMD64/ARM64)

**Tags geradas**: `latest`, `production`, `main-<commit-sha>`, versão customizada

### Configuração de Secrets

Para que os workflows funcionem, configure os seguintes secrets no repositório GitHub:

```bash
DOCKERHUB_USERNAME=seu_usuario_dockerhub
DOCKERHUB_PASSWORD=seu_token_dockerhub
```

### Como Obter Token do Docker Hub

1. Acesse [Docker Hub](https://hub.docker.com/)
2. Vá em Account Settings → Security
3. Clique em "New Access Token"
4. Defina um nome descritivo (ex: `github-actions`)
5. Copie o token gerado
6. Adicione como `DOCKERHUB_PASSWORD` no GitHub

### Branches e Deploys

- **`main`**: Produção - deploy automático
- **`staging`** ou **`develop`**: Homologação - deploy automático
- **Pull Requests**: Build de teste (sem deploy)

### Imagens Docker

As imagens são publicadas no Docker Hub com o padrão:
```
docker.io/SEU_USERNAME/nuxt-supabase-test:TAG
```

**Exemplos de uso**:

```bash
# Produção
docker run -p 80:80 docker.io/SEU_USERNAME/nuxt-supabase-test:latest

# Homologação
docker run -p 80:80 docker.io/SEU_USERNAME/nuxt-supabase-test:staging-latest

# Versão específica
docker run -p 80:80 docker.io/SEU_USERNAME/nuxt-supabase-test:v1.0.0
```

### Arquivos de Configuração

- **`.github/workflows/deploy-homologacao.yml`**: Workflow de homologação
- **`.github/workflows/deploy-production.yml`**: Workflow de produção
- **`Dockerfile`**: Configuração multi-stage para Nuxt.js SPA
- **`.dockerignore`**: Otimização do contexto de build

### Recursos Adicionais

- 🔒 **Segurança**: Scan de vulnerabilidades com Trivy
- 🚀 **Performance**: Build cache e multi-plataforma
- 📊 **Monitoramento**: Cobertura de testes e relatórios
- 🔄 **Automação**: Deploy automático baseado em branches
