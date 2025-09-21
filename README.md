# 📦 Packing Service API

API para automatizar o processo de **embalagem de pedidos** da loja de jogos do Seu Manoel.
Dado um conjunto de pedidos com produtos e suas dimensões, a API retorna qual o tamanho de caixa deve ser usado para cada pedido e quais produtos vão em cada caixa.

---

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [Swagger](https://swagger.io/) para documentação
- [Docker](https://www.docker.com/) para containerização
- `class-validator` + `class-transformer` para validação
- Autenticação simples via **API Key**

---

## 📦 Caixas disponíveis

O sistema considera as seguintes caixas de papelão (em cm):

- **Caixa 1:** 30 x 40 x 80
- **Caixa 2:** 50 x 50 x 40
- **Caixa 3:** 50 x 80 x 60

---

## 🔑 Autenticação

O único endpoint requer um header de autenticação:

```http
x-api-key: <SECRET_KEY_HERE>
```

Defina a chave ao rodar o container (veja abaixo em **Execução com Docker**).

---

## 🐳 Execução com Docker

### 1. Build da imagem

```bash
docker build -t packing-service .
```

### 2. Executar o container

```bash
docker run -e API_KEY=<SECRET_KEY_HERE> -p 3000:3000 packing-service
```

Substitua `<SECRET_KEY_HERE>` pela chave que você deseja usar para autenticar as requisições.

A API ficará disponível em:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentação da API (Swagger)

Após iniciar a API, acesse no navegador:

👉 [http://localhost:3000/api](http://localhost:3000/api)

Lá você pode testar o endpoint diretamente.

---

## 🔗 Endpoint

### **POST** `/pack`

Recebe um JSON com pedidos e retorna as caixas usadas para cada pedido.

#### Exemplo de Request

```json
{
  "pedidos": [
    {
      "pedido_id": 1,
      "produtos": [
        {
          "produto_id": "PS5",
          "dimensoes": { "altura": 40, "largura": 10, "comprimento": 25 }
        },
        {
          "produto_id": "Volante",
          "dimensoes": { "altura": 40, "largura": 30, "comprimento": 30 }
        }
      ]
    }
  ]
}
```

#### Exemplo de Response

```json
{
  "pedidos": [
    {
      "pedido_id": 1,
      "caixas": [
        {
          "caixa_id": "Caixa 2",
          "produtos": ["PS5", "Volante"]
        }
      ]
    }
  ]
}
```

---

## 🧪 Testes

### Testes unitários

```bash
npm run test
```

### Testes e2e

```bash
npm run test:e2e
```

---

## 📌 Requisitos atendidos

- Microserviço em Node/NestJS
- API documentada com Swagger
- Execução via Docker
- Autenticação simples via API Key
- Testes unitários e e2e
