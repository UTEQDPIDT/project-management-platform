import { BadRequestException, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateProductDto } from './create-product.dto';
import { ProductSchema } from '../../schemas/product.schema';

describe('product creation without a co-author', () => {
  const id = '507f1f77bcf86cd799439011';
  const payload = {
    name: 'Producto',
    category: id,
    subcategory: id,
    projectId: id,
  };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const metadata = { type: 'body' as const, metatype: CreateProductDto };

  it('accepts a creation request without a co-author', async () => {
    await expect(pipe.transform(payload, metadata)).resolves.toMatchObject(payload);
  });

  it('still rejects invalid category IDs', async () => {
    await expect(
      pipe.transform({ ...payload, category: 'invalid' }, metadata),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates a product document without a co-author', () => {
    const ProductModel = mongoose.model('ProductCreationTest', ProductSchema);
    const product = new ProductModel({
      ...payload,
      owner: id,
      updatedBy: id,
    });

    expect(product.validateSync()).toBeUndefined();
  });
});
