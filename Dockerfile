FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps chromium
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
