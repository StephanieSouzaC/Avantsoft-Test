import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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
      { id: 1, name: 'abc', price: 10, sku: 'A1', createdAt: new Date(), updatedAt: new Date() },
    ];
    mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

    const result = await service.findAll();
    expect(result[0]).toHaveProperty('missingLetter');
  });

});

