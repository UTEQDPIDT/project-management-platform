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

  async create(createProductDto: CreateProductDto) {
    try {
      const createdProduct = new this.productModel(createProductDto);
      return await createdProduct.save();
    } catch (err: any) {
      throw new BadRequestException(
        'Error al crear el producto: ' + err.message,
      );
    }
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  findOne(id: string) {
    const product = this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID: ${id} not found`);
    }
    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );

      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID: ${id} not found`);
      }

      return updatedProduct;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  remove(id: string) {
    const deletedProduct = this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct)
      throw new NotFoundException(`Product with ID: ${id} not found`);

    return deletedProduct;
  }
}
