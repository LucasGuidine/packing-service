import { PackRequestDto } from '../dtos/pack-request.dto';
import { PackResponseDto } from '../dtos/pack-response.dto';

export interface IPackagingService {
  packOrders(input: PackRequestDto): Promise<PackResponseDto>;
}
