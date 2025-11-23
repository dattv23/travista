# ============================================================
# 1) BUILD STAGE (Playwright + Node + Browsers Installed)
# ============================================================
FROM mcr.microsoft.com/playwright:v1.56.1-jammy AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npx tsc-alias

# ============================================================
# 2) RUN STAGE
# ============================================================
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["npm", "start"]
