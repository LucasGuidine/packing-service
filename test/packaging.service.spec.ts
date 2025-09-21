import { PackagingService } from '../src/pack/services/packaging.service';

describe('PackagingService', () => {
  let service: PackagingService;

  beforeEach(() => {
    service = new PackagingService();
  });

  it('must package single order in at least one box', async () => {
    const input = {
      pedidos: [
        {
          pedido_id: 1,
          produtos: [
            {
              produto_id: 'P1',
              dimensoes: { altura: 10, largura: 10, comprimento: 10 },
            },
            {
              produto_id: 'P2',
              dimensoes: { altura: 5, largura: 5, comprimento: 5 },
            },
          ],
        },
      ],
    };

    const out = await service.packOrders(input);
    expect(out).toBeDefined();
    expect(out.pedidos).toBeDefined();
    expect(out.pedidos.length).toBe(1);
    const boxes = out.pedidos[0].caixas;
    expect(Array.isArray(boxes)).toBeTruthy();
    expect(boxes.length).toBeGreaterThan(0);
    const allPacked = boxes.flatMap((c: any) => c.produtos);
    expect(new Set(allPacked)).toEqual(new Set(['P1', 'P2']));
  });

  it('must mark product that does not fit in any box', async () => {
    const input = {
      pedidos: [
        {
          pedido_id: 2,
          produtos: [
            {
              produto_id: 'GIGANTE',
              dimensoes: { altura: 200, largura: 200, comprimento: 200 },
            },
          ],
        },
      ],
    };

    const out = await service.packOrders(input);
    const boxes = out.pedidos[0].caixas;
    expect(boxes[0].caixa_id).toBeNull();
    expect(boxes[0].observacao).toMatch(/não cabe/i);
  });
});
