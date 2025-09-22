import { Injectable } from '@nestjs/common';
import { IPackagingService } from '../interfaces/packaging.interface';
import { BOXES } from '../../common/constants/boxes.const';
import { PackRequestDto, ProductDto } from '../dtos/pack-request.dto';
import { PackedBoxDto } from '../dtos/pack-response.dto';

function getAll3dOrientations(arr: number[]) {
  const res: number[][] = [];
  const [a, b, c] = arr;
  res.push([a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]);
  return Array.from(new Set(res.map((r) => r.join(',')))).map((s) =>
    s.split(',').map((n) => Number(n)),
  );
}

function modifyOrientation(prod: ProductDto, box: any): boolean {
  const dims = [
    prod.dimensoes.altura,
    prod.dimensoes.largura,
    prod.dimensoes.comprimento,
  ];
  const perms = getAll3dOrientations(dims);
  return perms.some(
    (p) => p[0] <= box.height && p[1] <= box.width && p[2] <= box.length,
  );
}

function volume(prod: ProductDto) {
  const d = prod.dimensoes;
  return d.altura * d.largura * d.comprimento;
}

@Injectable()
export class PackagingService implements IPackagingService {
  private boxes = BOXES;

  async packOrders(input: PackRequestDto) {
    const results: {
      pedido_id: number;
      caixas: PackedBoxDto[];
    }[] = [];

    input.pedidos.forEach((order) => {
      const products = order.produtos;
      const dontFit = products.filter(
        (p) => !this.boxes.some((b) => modifyOrientation(p, b)),
      );
      const fit = products.filter((p) =>
        this.boxes.some((b) => modifyOrientation(p, b)),
      );

      const boxesResult: PackedBoxDto[] = [];

      dontFit.forEach((p) => {
        boxesResult.push({
          caixa_id: null,
          produtos: [p.produto_id],
          observacao: 'Produto não cabe em nenhuma caixa disponível.',
        });
      });

      if (fit.length === 0) {
        results.push({
          pedido_id: order.pedido_id,
          caixas: boxesResult,
        });
        return;
      }

      const totalVolume = fit.reduce((s, p) => s + volume(p), 0);
      const boxesOrdered = [...this.boxes].sort((a, b) => a.volume - b.volume);
      let placedAllSingleBox = false;

      boxesOrdered.forEach((box) => {
        if (placedAllSingleBox) return;
        const allFitsIndividually = fit.every((p) => modifyOrientation(p, box));
        if (allFitsIndividually && totalVolume <= box.volume) {
          boxesResult.push({
            caixa_id: box.id,
            produtos: fit.map((p) => p.produto_id),
          });
          placedAllSingleBox = true;
        }
      });

      if (!placedAllSingleBox) {
        let remaining = [...fit].sort((a, b) => volume(b) - volume(a));

        const processRemaining = () => {
          if (remaining.length === 0) return;

          let best = { box: null as any, packed: [] as ProductDto[] };
          this.boxes.forEach((box) => {
            let remVol = box.volume;
            const packedSim: ProductDto[] = [];
            remaining.forEach((p) => {
              if (modifyOrientation(p, box) && volume(p) <= remVol) {
                packedSim.push(p);
                remVol -= volume(p);
              }
            });
            if (packedSim.length > best.packed.length) {
              best = { box, packed: packedSim };
            }
          });

          if (best.box == null || best.packed.length === 0) {
            const item = remaining[0];
            const boxThatFits = this.boxes.find((b) =>
              modifyOrientation(item, b),
            );
            if (!boxThatFits) {
              boxesResult.push({
                caixa_id: null,
                produtos: [item.produto_id],
                observacao: 'Produto não cabe em nenhuma caixa disponível.',
              });
              remaining = remaining.slice(1);
            } else {
              boxesResult.push({
                caixa_id: boxThatFits.id,
                produtos: [item.produto_id],
              });
              remaining = remaining.slice(1);
            }
          } else {
            boxesResult.push({
              caixa_id: best.box.id,
              produtos: best.packed.map((p) => p.produto_id),
            });
            const packedIds = new Set(best.packed.map((p) => p.produto_id));
            remaining = remaining.filter((p) => !packedIds.has(p.produto_id));
          }

          processRemaining();
        };

        processRemaining();
      }

      results.push({ pedido_id: order.pedido_id, caixas: boxesResult });
    });

    return { pedidos: results };
  }
}
