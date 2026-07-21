FROM node:22-alpine

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install production dependencies only (smaller image)
# Using `npm install` instead of `npm ci` to handle potential
# lockfile inconsistencies gracefully in the container build.
RUN npm install --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Grant ownership to the node user (built-in to node:alpine)
RUN chown -R node:node /app

# Health check — verifies backend is responding
# Uses Node.js built-in HTTP (no extra deps needed; wget/curl not in alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

EXPOSE 8000

# Switch to non-root user
USER node

CMD ["node", "server.js"]
