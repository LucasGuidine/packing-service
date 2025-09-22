import { Test, TestingModule } from '@nestjs/testing';
import { PackController } from './pack.controller';
import { PackagingService } from '../services/packaging.service';

describe('PackController (unit)', () => {
  let controller: PackController;
  let service: PackagingService;

  const baseMockResponse = {
    pedidos: [
      {
        pedido_id: 1,
        caixas: [{ caixa_id: 'Caixa 2', produtos: ['PS5', 'Volante'] }],
      },
    ],
  };

  const mockService = {
    packOrders: jest.fn().mockResolvedValue(baseMockResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackController],
      providers: [{ provide: PackagingService, useValue: mockService }],
    }).compile();

    controller = module.get<PackController>(PackController);
    service = module.get<PackagingService>(PackagingService);
    jest.clearAllMocks();
  });

  it('must be defined', () => {
    expect(controller).toBeDefined();
  });

  it('must call packagingService.packOrders when posting', async () => {
    const body = { pedidos: [{ pedido_id: 1, produtos: [] }] };
    const resp = await controller.pack(body as any);
    expect(service.packOrders).toHaveBeenCalledWith(body);
    expect(resp).toHaveProperty('pedidos');
    expect(resp.pedidos[0].pedido_id).toBe(1);
  });

  it('should return product marked as "não cabe" when service returns caixa_id null', async () => {
    (service.packOrders as jest.Mock).mockResolvedValueOnce({
      pedidos: [
        {
          pedido_id: 5,
          caixas: [
            {
              caixa_id: null,
              produtos: ['Cadeira Gamer'],
              observacao: 'Produto não cabe em nenhuma caixa disponível.',
            },
          ],
        },
      ],
    });

    const body = { pedidos: [{ pedido_id: 5, produtos: [] }] };
    const resp = await controller.pack(body as any);

    expect(service.packOrders).toHaveBeenCalledWith(body);
    const pedido = resp.pedidos.find((p: any) => p.pedido_id === 5);
    expect(pedido).toBeDefined();
    expect(pedido.caixas.length).toBeGreaterThan(0);
    expect(pedido.caixas[0].caixa_id).toBeNull();
    expect(pedido.caixas[0].observacao).toMatch(/não cabe/i);
  });

  it('should propagate errors from the service (simulate service failure)', async () => {
    (service.packOrders as jest.Mock).mockRejectedValueOnce(
      new Error('service failure'),
    );

    const body = { pedidos: [{ pedido_id: 99, produtos: [] }] };

    await expect(controller.pack(body as any)).rejects.toThrow(
      'service failure',
    );
    expect(service.packOrders).toHaveBeenCalledWith(body);
  });
});
