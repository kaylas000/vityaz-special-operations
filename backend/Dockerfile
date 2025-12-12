# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY backend/package-lock.json backend/ || true

# Install dependencies
RUN npm ci

WORKDIR /app/backend
RUN npm ci

# Copy source code
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/.env* ./

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

# Copy from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/.env* ./

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
