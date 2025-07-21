import { IsOptional, IsString, IsPositive, IsNotEmpty } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  sku?: string;
}
