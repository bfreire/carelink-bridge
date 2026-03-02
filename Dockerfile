FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim

ENV NODE_ENV=production \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  PUPPETEER_HEADLESS=true \
  CARELINK_NON_INTERACTIVE=true \
  CARELINK_LOGINDATA_FILE=/app/data/logindata.json \
  USE_PROXY=false

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  ca-certificates \
  dumb-init \
  fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh && mkdir -p /app/data

VOLUME ["/app/data"]

ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]
