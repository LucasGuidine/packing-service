import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PackagingService } from '../services/packaging.service';
import { PackRequestDto } from '../dtos/pack-request.dto';
import { PackResponseDto } from '../dtos/pack-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiSecurity,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../auth/api-key.guard';

@ApiTags('pack')
@Controller('pack')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class PackController {
  constructor(private readonly packagingService: PackagingService) {}

  @Post()
  @ApiOperation({ summary: 'Packs orders and returns used boxes' })
  @ApiCreatedResponse({ type: PackResponseDto })
  async pack(@Body() body: PackRequestDto): Promise<PackResponseDto> {
    return this.packagingService.packOrders(body);
  }
}
