import { Injectable } from '@nestjs/common';
import { IPackagingService } from '../interfaces/packaging.interface';
import { BOXES } from '../../common/constants/boxes.const';
import { PackRequestDto, ProductDto } from '../dtos/pack-request.dto';
import { PackedBoxDto } from '../dtos/pack-response.dto';

function permutations(arr: number[]) {
  const res: number[][] = [];
  const [a, b, c] = arr;
  res.push([a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]);
  return Array.from(new Set(res.map((r) => r.join(',')))).map((s) =>
    s.split(',').map((n) => Number(n)),
  );
}

function fitsInBox(prod: ProductDto, box: any): boolean {
  const dims = [
    prod.dimensoes.altura,
    prod.dimensoes.largura,
    prod.dimensoes.comprimento,
  ];
  const perms = permutations(dims);
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

    for (const order of input.pedidos) {
      const products = order.produtos;
      const dontFit = products.filter(
        (p) => !this.boxes.some((b) => fitsInBox(p, b)),
      );
      const fit = products.filter((p) =>
        this.boxes.some((b) => fitsInBox(p, b)),
      );

      const boxesResult: PackedBoxDto[] = [];

      for (const p of dontFit) {
        boxesResult.push({
          caixa_id: null,
          produtos: [p.produto_id],
          observacao: 'Produto não cabe em nenhuma caixa disponível.',
        });
      }

      if (fit.length === 0) {
        results.push({
          pedido_id: order.pedido_id,
          caixas: boxesResult,
        });
        continue;
      }

      const totalVolume = fit.reduce((s, p) => s + volume(p), 0);
      const boxesOrdered = [...this.boxes].sort((a, b) => a.volume - b.volume);
      let placedAllSingleBox = false;
      for (const box of boxesOrdered) {
        const allFitsIndividually = fit.every((p) => fitsInBox(p, box));
        if (allFitsIndividually && totalVolume <= box.volume) {
          boxesResult.push({
            caixa_id: box.id,
            produtos: fit.map((p) => p.produto_id),
          });
          placedAllSingleBox = true;
          break;
        }
      }

      if (!placedAllSingleBox) {
        let remaining = [...fit].sort((a, b) => volume(b) - volume(a));
        while (remaining.length > 0) {
          let best = { box: null as any, packed: [] as ProductDto[] };
          for (const box of this.boxes) {
            let remVol = box.volume;
            const packedSim: ProductDto[] = [];
            for (const p of remaining) {
              if (fitsInBox(p, box) && volume(p) <= remVol) {
                packedSim.push(p);
                remVol -= volume(p);
              }
            }
            if (packedSim.length > best.packed.length) {
              best = { box, packed: packedSim };
            }
          }

          if (best.box == null || best.packed.length === 0) {
            const item = remaining[0];
            const boxThatFits = this.boxes.find((b) => fitsInBox(item, b));
            if (!boxThatFits) {
              boxesResult.push({
                caixa_id: null,
                produtos: [item.produto_id],
                observacao: 'Produto não cabe em nenhuma caixa disponível.',
              });
              remaining.shift();
            } else {
              boxesResult.push({
                caixa_id: boxThatFits.id,
                produtos: [item.produto_id],
              });
              remaining.shift();
            }
          } else {
            boxesResult.push({
              caixa_id: best.box.id,
              produtos: best.packed.map((p) => p.produto_id),
            });
            const packedIds = new Set(best.packed.map((p) => p.produto_id));
            remaining = remaining.filter((p) => !packedIds.has(p.produto_id));
          }
        }
      }

      results.push({ pedido_id: order.pedido_id, caixas: boxesResult });
    }

    return { pedidos: results };
  }
}
