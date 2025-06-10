# backend/Dockerfile
FROM node:18

# Set production environment
ENV NODE_ENV=production

# Install system dependencies for code execution
RUN apt-get update && \
    apt-get install -y g++ python3 python3-pip curl && \
    curl -fsSL https://download.oracle.com/java/24/latest/jdk-24_linux-x64_bin.deb -o jdk-24.deb && \
    apt-get install -y ./jdk-24.deb && \
    rm jdk-24.deb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/jdk-24
ENV PATH="$JAVA_HOME/bin:$PATH"

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (only production dependencies)
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8000

# Use node directly instead of nodemon for production
CMD ["node", "index.js"]