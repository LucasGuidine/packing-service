FROM node:18-alpine

WORKDIR /usr/src/app

# Build tools para dependências nativas
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Instala pacotes
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
