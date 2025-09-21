import { Test, TestingModule } from '@nestjs/testing';
import { PackController } from './controllers/pack.controller';
import { PackagingService } from './services/packaging.service';

describe('PackController (unit)', () => {
  let controller: PackController;
  let service: PackagingService;

  const mockService = {
    packOrders: jest.fn().mockResolvedValue({
      pedidos: [
        {
          pedido_id: 1,
          caixas: [{ caixa_id: 'Caixa 2', produtos: ['PS5', 'Volante'] }],
        },
      ],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackController],
      providers: [{ provide: PackagingService, useValue: mockService }],
    }).compile();

    controller = module.get<PackController>(PackController);
    service = module.get<PackagingService>(PackagingService);
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
});
