# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY frontend/package-lock.json frontend/ || true

RUN npm ci

WORKDIR /app/frontend
RUN npm ci

COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html frontend/vite.config.ts frontend/tsconfig.json ./
COPY frontend/.env* ./

RUN npm run build

# Production stage
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
