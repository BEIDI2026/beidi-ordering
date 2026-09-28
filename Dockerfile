FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3000
WORKDIR /app/dist
CMD ["node", "main.js"]
