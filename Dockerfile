FROM ghcr.io/puppeteer/puppeteer:21.0.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "index.js"]
