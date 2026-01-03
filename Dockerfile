# Multi-stage build para Nuxt.js SPA
FROM node:22-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Stage de build
FROM base AS builder

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM nginx:alpine AS production

# Copiar configuração customizada do nginx (se existir)
# COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados para o nginx
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Copiar configuração do nginx para SPA
RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    location / {\
        root /usr/share/nginx/html;\
        index index.html index.htm;\
        try_files $uri $uri/ /index.html;\
    }\
    # Cache headers para assets estáticos\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
}' > /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
