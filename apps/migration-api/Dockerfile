FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
RUN npm ci --omit=dev && npm rebuild better-sqlite3
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/data
EXPOSE 8080
CMD ["node", "dist/index.js"]
