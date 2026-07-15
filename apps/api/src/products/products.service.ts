import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { ClientSession, Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import {
  EntityType,
  FilePurpose,
  ProjectStatus,
  ProjectValidation,
} from '@repo/types';
import { Project } from '../schemas/project.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly filesService: FilesService,
  ) {}

  private async ensureProjectIsWritable(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .select('status validationStatus');

    if (!project) {
      throw new NotFoundException(`Project with ID: ${projectId} not found`);
    }

    if (
      project.status === ProjectStatus.CLOSED ||
      project.validationStatus === ProjectValidation.FINAL_VALIDATION
    ) {
      throw new ForbiddenException('Cannot create products for a closed project.');
    }
  }

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      await this.ensureProjectIsWritable(createProductDto.projectId.toString());

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
          FilePurpose.GENERIC,
          userId,
        );
      }

      return product;
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
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
      const product = await this.productModel.findById(id).select('projectId');

      if (!product) {
        throw new NotFoundException(`Product with ID: ${id} not found`);
      }

      await this.ensureProjectIsWritable(product.projectId.toString());

      if (file) {
        // Delete previous files
        const previousFiles = await this.filesService.findFilesForEntity(id);
        await this.filesService.deleteFiles(previousFiles);

        // Upload new file
        await this.filesService.uploadFile(
          file,
          id,
          EntityType.PRODUCT,
          FilePurpose.GENERIC,
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
      if (err instanceof HttpException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productModel.findById(id).select('projectId');

      if (!product) {
        throw new NotFoundException(`Product with ID: ${id} not found`);
      }

      await this.ensureProjectIsWritable(product.projectId.toString());

      const files = await this.filesService.findFilesForEntity(id);

      await this.filesService.deleteFiles(files);

      await this.productModel.findByIdAndDelete(id);

      return { message: 'Product deleted successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
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
