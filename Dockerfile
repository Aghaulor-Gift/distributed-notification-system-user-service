# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies required for node-gyp / bcrypt etc.
RUN apt-get update && apt-get install -y python3 make g++ openssl curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci

COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy built app
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the app
CMD ["node", "dist/main.js"]
