# Build stage
FROM node:20-alpine AS builder

# Build SDK first
WORKDIR /app/package
COPY package/package*.json ./
COPY package/tsconfig.json ./
COPY package/src ./src
RUN npm ci && npm run build

# Build backend
WORKDIR /app/docker-instance/server
COPY docker-instance/server/package*.json ./
# Install with SDK from local build
RUN npm ci
COPY docker-instance/server/prisma ./prisma
COPY docker-instance/server/src ./src
RUN npx prisma generate

# Build frontend
WORKDIR /app/docker-instance/web
COPY docker-instance/web/package*.json ./
RUN npm install --legacy-peer-deps
COPY docker-instance/web/ ./
# Passer l'URL de l'API globale au build
ARG GLOBAL_API_URL=http://localhost:3000
ENV VITE_GLOBAL_API_URL=${GLOBAL_API_URL}
# Forcer VITE_API_URL vide pour utiliser des chemins relatifs (même origine)
ENV VITE_API_URL=
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install embedded database engines so local DBs can run as child processes
# (no Docker socket required)
RUN apk add --no-cache \
    postgresql16 postgresql16-client \
    mariadb mariadb-client \
    redis \
    su-exec \
  && mkdir -p /run/mysqld && chown mysql:mysql /run/mysqld

# Copy backend artifacts (node_modules from builder includes all dependencies)
COPY --from=builder /app/docker-instance/server/node_modules ./server/node_modules
COPY --from=builder /app/docker-instance/server/prisma ./server/prisma
COPY --from=builder /app/docker-instance/server/src ./server/src

# Copy frontend build output
COPY --from=builder /app/docker-instance/web/dist ./public

# Copy startup scripts
COPY docker-instance/start-container.sh /app/start-container.sh
RUN chmod +x /app/start-container.sh

# Create data directory
RUN mkdir -p /app/data

# Environment
ENV PORT=3000
ENV NODE_ENV=production
ENV IN_DOCKER=true
# DATABASE_URL will be set dynamically by start-container.sh based on INSTANCE_ID
ENV DATABASE_URL="file:/app/data/instance.db"

EXPOSE 3000

CMD ["/bin/sh", "/app/start-container.sh"]
