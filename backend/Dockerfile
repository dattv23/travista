# ===========================
# 1. BUILD STAGE
# ===========================
FROM mcr.microsoft.com/playwright:v1.46.0-jammy AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (includes playwright already)
RUN npm install

COPY . .

RUN npm run build
RUN npx tsc-alias

# ===========================
# 2. RUN STAGE (Production)
# ===========================
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
