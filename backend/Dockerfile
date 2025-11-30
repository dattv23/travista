# ===============================
# 1) BUILD STAGE
# ===============================
FROM node:18-bullseye AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ===============================
# 2) RUN STAGE
# ===============================
FROM node:18-bullseye

WORKDIR /app

# Copy production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "start"]
