# ---------- 1️⃣ BUILD STAGE ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json tsconfig*.json ./

# Install all dependencies including dev (for TypeScript)
RUN npm install --include=dev

# Copy all project files
COPY . .

# Build TypeScript → JavaScript + copy swagger.json
RUN npm run build

# ---------- 2️⃣ RUNTIME STAGE ----------
FROM node:18-alpine AS production

WORKDIR /app

# Copy package.json and lockfile for reproducible installs
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled build and swagger.json from builder
COPY --from=builder /app/dist ./dist

# Expose port 5000 (default API port)
EXPOSE 5000

# Start app
CMD ["node", "dist/src/index.js"]
