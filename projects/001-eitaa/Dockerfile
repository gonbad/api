FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source and contract
COPY app ./app
COPY contract ./contract
COPY scripts ./scripts

# Create persistent data directory
RUN mkdir -p /data /app/data && chown -R node:node /app /data

USER node

EXPOSE 8016

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8016/api/health || exit 1

CMD ["node", "app/server.js"]
