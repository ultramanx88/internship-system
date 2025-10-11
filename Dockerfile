FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Copy environment file
COPY docker.env .env

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy only necessary source files
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY public/ ./public/
COPY next.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY middleware.ts ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]