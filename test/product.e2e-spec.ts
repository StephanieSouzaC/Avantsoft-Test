import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';


describe('Product E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma.product.deleteMany();
    } finally {
      await app.close();
    }
  });

  it('should create a product', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'E2E Test', price: 50, sku: 'E2E123' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('E2E Test');
  });

  it('should fail to create duplicated SKU', async () => {
    await prisma.product.create({
      data: { name: 'Dup', price: 10, sku: 'DUPSKU' },
    });

    await request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Dup 2', price: 15, sku: 'DUPSKU' })
      .expect(409);
  });

  it('should return missingLetter in GET', async () => {
    await prisma.product.create({
      data: { name: 'abcde', price: 10, sku: 'ABC' },
    });

    const res = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(res.body[0]).toHaveProperty('missingLetter');
  });
});
