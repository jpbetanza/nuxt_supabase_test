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
    <AppHeader />

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
