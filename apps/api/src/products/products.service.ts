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
import { FilesService } from '../files/files.service';
import { EntityType } from '@repo/types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      const product = new this.productModel({
        ...createProductDto,
        owner: userId,
        updatedBy: userId,
      });

      await product.save();

      if (product) {
        await this.filesService.uploadFile(
          file,
          product._id.toString(),
          EntityType.PRODUCT,
          userId,
        );
      }

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

  async findByProject(projectId: string) {
    return await this.productModel
      .find({ projectId })
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        // Delete previous files
        const previousFiles = await this.filesService.findFilesForEntity(id);
        await this.filesService.deleteFiles(previousFiles);

        // Upload new file
        await this.filesService.uploadFile(
          file,
          id,
          EntityType.PRODUCT,
          userId,
        );
      }

      // Update product
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

  async remove(id: string) {
    try {
      const files = await this.filesService.findFilesForEntity(id);

      await this.filesService.deleteFiles(files);

      await this.productModel.findByIdAndDelete(id);

      return { message: 'Product deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteMany(projectId: string, session: ClientSession) {
    const products = await this.productModel
      .find({ projectId })
      .session(session)
      .exec();

    const filesPerProduct = await Promise.all(
      products.map((product) =>
        this.filesService.findFilesForEntity(product._id.toString()),
      ),
    );

    const files = filesPerProduct.flat();

    await this.filesService.deleteFiles(files);

    await this.productModel.deleteMany({ projectId }, { session });
  }
}
