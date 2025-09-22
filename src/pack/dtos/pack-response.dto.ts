import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';

export class PackedBoxDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  caixa_id: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  produtos: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  observacao?: string;
}

export class RequestResponseDto {
  @ApiProperty()
  @IsNumber()
  pedido_id: number;

  @ApiProperty({ type: [PackedBoxDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackedBoxDto)
  caixas: PackedBoxDto[];
}

export class PackResponseDto {
  @ApiProperty({ type: [RequestResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestResponseDto)
  pedidos: RequestResponseDto[];
}
