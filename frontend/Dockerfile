# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies with legacy peer deps
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copy source code
COPY public ./public
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "build", "-l", "3000"]
