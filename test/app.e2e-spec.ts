import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Packing Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.API_KEY = process.env.API_KEY ?? 'test-api-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /pack - should return packing result with same number of orders', async () => {
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

    const apiKey = process.env.API_KEY;

    const res = await request(app.getHttpServer())
      .post('/pack')
      .set('x-api-key', apiKey)
      .send(body)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.pedidos)).toBeTruthy();
    expect(res.body.pedidos.length).toBe(body.pedidos.length);

    for (const requestResp of res.body.pedidos) {
      expect(requestResp).toHaveProperty('pedido_id');
      expect(requestResp).toHaveProperty('caixas');
      expect(Array.isArray(requestResp.caixas)).toBeTruthy();
    }

    const order5 = res.body.pedidos.find((p: any) => p.pedido_id === 5);
    expect(order5).toBeDefined();
    expect(order5.caixas.length).toBeGreaterThan(0);
    const hasNullBox = order5.caixas.some(
      (c: any) => c.caixa_id === null || c.observacao,
    );
    expect(hasNullBox).toBeTruthy();
  });
});
