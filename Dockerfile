# api/Dockerfile
FROM node:18-alpine

# Install curl and wget for health checks
RUN apk add --no-cache curl wget

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies first (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Debug: List files to ensure everything is copied
RUN ls -la

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Debug: Check if the start script exists in package.json
RUN cat package.json | grep -A 5 '"scripts"'

# Use development mode temporarily to see detailed logs
CMD ["npm", "run", "dev"]