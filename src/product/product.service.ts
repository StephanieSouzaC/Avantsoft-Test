import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { getMissingLetter } from './utils/missing-letter.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateProductDto) {
        try {
            return await this.prisma.product.create({ data });
        }
        catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('SKU already exists');
            }

            throw new BadRequestException('Could not create product');
        }
    }

    async findAll() {
        const products = await this.prisma.product.findMany({
            orderBy: { name: 'asc' },
        });

        return products.map(p => ({
            ...p,
            missingLetter: getMissingLetter(p.name),
        }));
    }

    async findOne(id: number) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        return {
            ...product,
            missingLetter: getMissingLetter(product.name),
        };
    }

    async update(id: number, data: UpdateProductDto) {
        try {
            return await this.prisma.product.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('SKU already exists');
            }

            throw new BadRequestException('Could not create product');
        }
    }

    async remove(id: number) {
        return this.prisma.product.delete({ where: { id } });
    }
}

