# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-alpine AS builder

# Outils de compilation pour les modules natifs (ex: better-sqlite3 sur musl)
RUN apk add --no-cache python3 make g++

# Backend
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server/prisma ./prisma
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npx prisma generate

# Frontend (build direct via Vite : pas de typecheck bloquant en conteneur)
WORKDIR /app/web
COPY web/package.json ./
RUN npm install --legacy-peer-deps
COPY web/ ./
# URL de l'API globale passée au build (chemins relatifs par défaut = même origine)
ARG GLOBAL_API_URL=http://localhost:3000
ENV VITE_GLOBAL_API_URL=${GLOBAL_API_URL}
ENV VITE_API_URL=
RUN npx vite build

# ---------- Production stage ----------
FROM node:20-alpine
WORKDIR /app

# Moteurs de bases de données embarqués (exécutés en sous-processus, sans socket Docker)
RUN apk add --no-cache \
    postgresql16 postgresql16-client \
    mariadb mariadb-client \
    redis \
    su-exec \
  && mkdir -p /run/mysqld && chown mysql:mysql /run/mysqld

# Artefacts backend (node_modules du builder = toutes les dépendances, dont tsx & prisma)
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/tsconfig.json ./server/tsconfig.json
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/server/src ./server/src

# Build frontend
COPY --from=builder /app/web/dist ./public

# Script de démarrage
COPY start-container.sh /app/start-container.sh
RUN chmod +x /app/start-container.sh

# Répertoire de données (base locale)
RUN mkdir -p /app/data

ENV PORT=3000
ENV NODE_ENV=production
ENV IN_DOCKER=true
# DATABASE_URL peut être surchargé au runtime
ENV DATABASE_URL="file:/app/data/instance.db"

EXPOSE 3000

CMD ["/bin/sh", "/app/start-container.sh"]
