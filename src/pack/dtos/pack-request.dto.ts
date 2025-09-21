import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  IsInt,
  IsString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DimensionsDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  altura: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  largura: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  comprimento: number;
}

export class ProductDto {
  @ApiProperty()
  @IsString()
  produto_id: string;

  @ApiProperty({ type: () => DimensionsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensoes: DimensionsDto;
}

export class OrderDto {
  @ApiProperty()
  @IsInt()
  pedido_id: number;

  @ApiProperty({ type: () => ProductDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  produtos: ProductDto[];
}

export class PackRequestDto {
  @ApiProperty({ type: () => OrderDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  pedidos: OrderDto[];
}
