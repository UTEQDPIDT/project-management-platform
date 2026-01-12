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
    projectId: string,
    session?: ClientSession,
  ) {
    try {
      const product = new this.productModel({
        ...createProductDto,
        owner: userId,
        updatedBy: userId,
        projectId,
      });

      await product.save({ session });

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
      .exec();
  }

  findOne(id: string) {
    const product = this.productModel
      .findById(id)
      .populate('category')
      .populate('subcategory')
      .populate('owner')
      .populate('updatedBy')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID: ${id} not found`);
    }
    return product;
  }

  findByUser(userId: string) {
    return this.productModel.find({ owner: userId });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    try {
      const updatedProduct = await this.productModel.findByIdAndUpdate(
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

  async deleteMany(projectId: string, session: ClientSession) {
    await this.productModel.deleteMany({ projectId }, { session });
  }
}
