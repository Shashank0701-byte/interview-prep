# ============================================================
# STAGE 1: Build the Vite React application
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for build)
# Note: Using `npm install` instead of `npm ci` because the lockfile
# may be out of sync with package.json after dependency updates.
# This ensures a clean install in the container environment.
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production bundle
RUN npm run build

# ============================================================
# STAGE 2: Serve with Nginx
# ============================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check — nginx:alpine ships with BusyBox wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/ > /dev/null 2>&1 || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

