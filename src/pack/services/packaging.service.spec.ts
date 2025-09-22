import { PackagingService } from './packaging.service';

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

  it('should return same number of pedidos as input and keep pedido_id mapping', async () => {
    const input = {
      pedidos: [
        { pedido_id: 10, produtos: [] },
        {
          pedido_id: 20,
          produtos: [
            {
              produto_id: 'A',
              dimensoes: { altura: 5, largura: 5, comprimento: 5 },
            },
          ],
        },
      ],
    };

    const out = await service.packOrders(input);
    expect(out.pedidos.length).toBe(2);
    const ids = out.pedidos.map((p: any) => p.pedido_id).sort();
    expect(ids).toEqual([10, 20]);
  });

  it('should handle empty produtos array (no caixas)', async () => {
    const input = {
      pedidos: [{ pedido_id: 3, produtos: [] }],
    };

    const out = await service.packOrders(input);
    expect(out.pedidos.length).toBe(1);
    const caixas = out.pedidos[0].caixas;
    expect(Array.isArray(caixas)).toBeTruthy();
    expect(caixas.length).toBe(0);
  });

  it('should pack an order into multiple boxes when items naturally split (realistic sample)', async () => {
    const input = {
      pedidos: [
        {
          pedido_id: 6,
          produtos: [
            {
              produto_id: 'Webcam',
              dimensoes: { altura: 7, largura: 10, comprimento: 5 },
            },
            {
              produto_id: 'Microfone',
              dimensoes: { altura: 50, largura: 20, comprimento: 20 },
            },
            {
              produto_id: 'Monitor',
              dimensoes: { altura: 100, largura: 60, comprimento: 20 },
            },
            {
              produto_id: 'Notebook',
              dimensoes: { altura: 2, largura: 35, comprimento: 25 },
            },
          ],
        },
      ],
    };

    const out = await service.packOrders(input);
    expect(out.pedidos.length).toBe(1);
    const caixas = out.pedidos[0].caixas;
    expect(Array.isArray(caixas)).toBeTruthy();
    expect(caixas.length).toBeGreaterThanOrEqual(2);

    const packedProducts = caixas.flatMap((c: any) => c.produtos);
    expect(new Set(packedProducts)).toEqual(
      new Set(['Webcam', 'Microfone', 'Monitor', 'Notebook']),
    );
  });

  it('should allow rotation so a product fits when rotated', async () => {
    const input = {
      pedidos: [
        {
          pedido_id: 7,
          produtos: [
            {
              produto_id: 'ROTACIONAL',
              dimensoes: { altura: 80, largura: 30, comprimento: 30 },
            },
          ],
        },
      ],
    };

    const out = await service.packOrders(input);
    expect(out.pedidos.length).toBe(1);
    const caixas = out.pedidos[0].caixas;
    expect(Array.isArray(caixas)).toBeTruthy();
    expect(caixas.length).toBeGreaterThan(0);
    expect(caixas[0].caixa_id).not.toBeNull();
    expect(caixas[0].produtos).toContain('ROTACIONAL');
  });

  it('should minimize boxes heuristically for many small items (all items must be packed)', async () => {
    const produtos = Array.from({ length: 12 }).map((_, i) => ({
      produto_id: `small-${i}`,
      dimensoes: { altura: 10, largura: 10, comprimento: 10 },
    }));

    const input = { pedidos: [{ pedido_id: 8, produtos }] };
    const out = await service.packOrders(input);
    expect(out.pedidos.length).toBe(1);
    const caixas = out.pedidos[0].caixas;
    const allPacked = caixas.flatMap((c: any) => c.produtos);
    expect(new Set(allPacked).size).toBe(12);
    expect(caixas.length).toBeLessThan(12);
  });
});
