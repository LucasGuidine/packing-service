import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Packing Service (e2e)', () => {
  let app: INestApplication;
  process.env.API_KEY = process.env.API_KEY ?? 'test-api-key';
  const apiKey = process.env.API_KEY || 'test-api-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /pack - should return packing result with same number of orders (happy path)', async () => {
    const body = {
      pedidos: [
        {
          pedido_id: 1,
          produtos: [
            {
              produto_id: 'PS5',
              dimensoes: { altura: 40, largura: 10, comprimento: 25 },
            },
            {
              produto_id: 'Volante',
              dimensoes: { altura: 40, largura: 30, comprimento: 30 },
            },
          ],
        },
        {
          pedido_id: 5,
          produtos: [
            {
              produto_id: 'Cadeira Gamer',
              dimensoes: { altura: 120, largura: 60, comprimento: 70 },
            },
          ],
        },
      ],
    };

    const res = await request(app.getHttpServer())
      .post('/pack')
      .set('x-api-key', apiKey)
      .send(body)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.pedidos)).toBeTruthy();
    expect(res.body.pedidos.length).toBe(body.pedidos.length);

    const pedido5 = res.body.pedidos.find((p: any) => p.pedido_id === 5);
    expect(pedido5).toBeDefined();
    const hasNullBox = pedido5.caixas.some(
      (c: any) => c.caixa_id === null || c.observacao,
    );
    expect(hasNullBox).toBeTruthy();
  });

  it('POST /pack - should return 401 when x-api-key header is missing or invalid', async () => {
    const body = {
      pedidos: [
        {
          pedido_id: 2,
          produtos: [
            {
              produto_id: 'Mouse',
              dimensoes: { altura: 5, largura: 8, comprimento: 12 },
            },
          ],
        },
      ],
    };

    await request(app.getHttpServer()).post('/pack').send(body).expect(401);

    await request(app.getHttpServer())
      .post('/pack')
      .set('x-api-key', 'wrongkey')
      .send(body)
      .expect(401);
  });

  it('POST /pack - should return 400 Bad Request for invalid body', async () => {
    const invalidBody = {
      pedidos: [
        {
          pedido_id: 'not-an-int',
          produtos: [
            {
              produto_id: 123,
              dimensoes: { altura: 0, largura: -5, comprimento: 10 },
            },
          ],
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/pack')
      .set('x-api-key', apiKey)
      .send(invalidBody)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty('statusCode', 400);
        expect(Array.isArray(res.body.message)).toBeTruthy();
        expect(res.body.message.length).toBeGreaterThan(0);
      });
  });
});
