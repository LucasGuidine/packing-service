FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Instala pacotes
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
