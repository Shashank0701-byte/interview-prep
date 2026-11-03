# ============================================================
# STAGE 1: Build the Vite React application
# ============================================================
# Debian matches the GitHub runner that installs this lockfile.
FROM node:22.23.4-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY package.json package-lock.json ./

# legacy-peer-deps matches frontend/.npmrc. Without it, npm ci rejects
# peer entries (monaco-editor, picomatch, dompurify, marked) that the lockfile omits.
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the production bundle
RUN npm run build

# ============================================================
# STAGE 2: Serve with Nginx
# ============================================================
# 1.27-alpine is Alpine 3.21, which is out of support and carries fixed OS CVEs.
FROM nginx/nginx-unprivileged:1.30.6-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check — nginx:alpine ships with BusyBox wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/ > /dev/null 2>&1 || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

