import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, ownerId: string): Promise<{id: string, message: string}> {
    try {
      const createdProduct = await this.productModel.create({
        ...createProductDto,
        owner: ownerId,
      });
      return {
        id: createdProduct._id.toString(),
        message: 'Product created successfully',
      };
    } catch (err: any) {
      throw new BadRequestException(
        'Error al crear el producto: ' + err.message,
      );
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID: ${id} not found`);
    }
    return product;
  }

  async findManyByIds(ids: string[]): Promise<string[]> {
  const products = await this.productModel.find({
    _id: { $in: ids },
  }).select('_id');

  if (products.length !== ids.length) {
    throw new NotFoundException('One or more products were not found');
  }

  return products.map(p => p._id.toString());
}


  async update(id: string, updateProductDto: UpdateProductDto): Promise<{ id: string, message: string }> {
    try {
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );

      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID: ${id} not found`);
      }

      return { id, message: 'Product updated successfully' };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: string): Promise<{ id: string; message: string }> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct)
      throw new NotFoundException(`Product with ID: ${id} not found`);

    return { id, message: 'Product deleted successfully' };
  }
}
