import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: string,
    session?: ClientSession,
  ) {
    console.log('Creating product');
    console.log('Dto', createProductDto);
    console.log('userId', userId);

    try {
      const product = new this.productModel({
        ...createProductDto,
        owner: userId,
        updatedBy: userId,
      });

      console.log('Created product', product);

      await product.save({ session });

      console.log('Product saved');

      return product;
    } catch (err: any) {
      throw new BadRequestException(
        'Error al crear el producto: ' + err.message,
      );
    }
  }

  async findAll() {
    return this.productModel
      .find()
      .populate('category')
      .populate('subcategory')
      .populate('owner')
      .populate('updatedBy')
      .populate('files')
      .exec();
  }

  findOne(id: string) {
    const product = this.productModel
      .findById(id)
      .populate('category')
      .populate('subcategory')
      .populate('owner')
      .populate('updatedBy')
      .populate('files')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID: ${id} not found`);
    }
    return product;
  }

  update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    try {
      const updatedProduct = this.productModel.findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          updatedBy: userId,
        },
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
