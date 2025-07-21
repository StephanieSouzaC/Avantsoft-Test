import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto: CreateProductDto = {
      name: 'Test',
      price: 50,
      sku: 'ABC',
    };
    mockService.create.mockResolvedValue({ id: 1, ...dto });

    const result = await controller.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all products', async () => {
    const mockProducts = [{ id: 1, name: 'A', price: 10, sku: 'X', missingLetter: 'b' }];
    mockService.findAll.mockResolvedValue(mockProducts);

    const result = await controller.findAll();
    expect(result).toEqual(mockProducts);
  });
});
