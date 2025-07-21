import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      price: 100,
      sku: 'TEST123',
    };

    const expectedResult = { id: 1, ...dto };
    mockPrismaService.product.create.mockResolvedValue(expectedResult);

    const result = await service.create(dto);
    expect(result).toEqual(expectedResult);
    expect(mockPrismaService.product.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return products with missingLetter', async () => {
    const mockProducts = [
      {
        id: 1,
        name: 'abc',
        price: 10,
        sku: 'A1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

    const result = await service.findAll();
    expect(result[0]).toHaveProperty('missingLetter');
  });

  it('should update a product when SKU is not in conflict', async () => {
    const id = 1;
    const updateData: UpdateProductDto = {
      name: 'Updated Product',
      price: 200,
      sku: 'UNIQUE123',
    };

    mockPrismaService.product.findUnique.mockResolvedValue({ id });
    mockPrismaService.product.update.mockResolvedValue({ id, ...updateData });

    const result = await service.update(id, updateData);

    expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({ where: { sku: updateData.sku } });
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
    });
    expect(result).toEqual({ id, ...updateData });
  });

  it('should throw ConflictException if SKU belongs to another product', async () => {
    const id = 1;
    const updateData: UpdateProductDto = {
      sku: 'DUPLICATE_SKU',
    };

    mockPrismaService.product.findUnique.mockResolvedValue({ id: 2 });

    await expect(service.update(id, updateData)).rejects.toThrow(ConflictException);
  });

  it('should update a product without checking SKU when not provided', async () => {
    const id = 1;
    const updateData: UpdateProductDto = {
      name: 'Updated Name',
      price: 150,
    };

    mockPrismaService.product.update.mockResolvedValue({ id, ...updateData });

    const result = await service.update(id, updateData);

    expect(mockPrismaService.product.findUnique).not.toHaveBeenCalled();
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id },
      data: updateData,
    });
  });
});