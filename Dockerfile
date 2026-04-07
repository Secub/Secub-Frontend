# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto del código y construye
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copia la config personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build generado por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]