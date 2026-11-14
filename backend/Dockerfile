FROM node:26.13.0-alpine

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install the lockfile's production dependencies so the image matches CI.
# Drop the bundled npm CLI afterwards. The process is `node server.js`, and
# Trivy flags HIGH issues in npm's own dependencies (brace-expansion, pacote, sigstore).
RUN npm ci --omit=dev && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

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
