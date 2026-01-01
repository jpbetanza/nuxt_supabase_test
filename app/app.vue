<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'pt'
  }
})

const title = 'Plataforma SaaS'
const description = 'Transforme seu dia a dia com nossa plataforma completa de soluções empresariais.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-image.png',
  twitterImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center space-x-2"
        >
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <UIcon
              name="i-lucide-zap"
              class="w-5 h-5 text-white dark:text-white"
            />
          </div>
          <span class="font-semibold text-lg">Plataforma SaaS</span>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="/login"
          variant="subtle"
          size="sm"
        >
          Entrar
        </UButton>

        <UButton
          to="/login"
          color="primary"
          size="sm"
        >
          Começar
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Plataforma SaaS. Todos os direitos reservados.
        </p>
      </template>

      <template #right>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-muted">Suporte • Privacidade • Termos</span>
          <UButton
            to="mailto:contato@plataformasaas.com"
            variant="ghost"
            size="xs"
            icon="i-lucide-mail"
            aria-label="Contato"
          />
        </div>
      </template>
    </UFooter>
  </UApp>
</template>
