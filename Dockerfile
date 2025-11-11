# =====================================
# 🐳 User Service - Production Dockerfile
# =====================================

# Base image
FROM node:20-slim

# Define build-time variables (for CI/CD secrets)
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB
ARG DATABASE_URL
ARG REDIS_HOST
ARG REDIS_PORT
ARG RABBITMQ_URL
ARG JWT_SECRET
ARG NODE_ENV=production
ARG PORT=3001

# Set environment variables
ENV POSTGRES_USER=$POSTGRES_USER \
    POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    POSTGRES_DB=$POSTGRES_DB \
    DATABASE_URL=$DATABASE_URL \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    RABBITMQ_URL=$RABBITMQ_URL \
    JWT_SECRET=$JWT_SECRET \
    NODE_ENV=$NODE_ENV \
    PORT=$PORT

# Working directory
WORKDIR /app

# Copy only dependency files for caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# Use OpenSSL legacy provider if needed
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Create a non-root user for security
RUN useradd -m appuser
USER appuser

# Expose application port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
