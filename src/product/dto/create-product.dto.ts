import { IsNotEmpty, IsString, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  @IsString()
  name: string;

  @IsPositive({ message: 'Price must be greater than zero' })
  @IsNotEmpty()
  price: number;

  @IsNotEmpty({ message: 'SKU must not be empty' })
  @IsString()
  sku: string;
}
