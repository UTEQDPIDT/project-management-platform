import { 
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { CreateStandaloneProductDto } from './dto/create-standalone-product.dto';
import { UpdateStandaloneProductDto } from './dto/update-standalone-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StandaloneProduct } from '../schemas/standalone-product.schema';
import { Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { EntityType, FilePurpose } from '@repo/types';

@Injectable()
export class StandaloneProductsService {
    constructor(
        @InjectModel(StandaloneProduct.name) private standaloneProductModel: Model<StandaloneProduct>,
        private readonly filesService: FilesService,
    ) {}

    async create(
        createStandaloneProductDto: CreateStandaloneProductDto,
        file: Express.Multer.File,
        userId: string,
    ){
        try{
            if (!file) {
                throw new BadRequestException('No se proporciono un archivo para el producto independiente');
            }

            const standaloneProduct = new this.standaloneProductModel({
                ...createStandaloneProductDto,
                owner: userId,
                updatedBy: userId,
            });

            await standaloneProduct.save();

            try {
                await this.filesService.uploadFile(
                    file,
                    standaloneProduct._id.toString(),
                    EntityType.STANDALONE_PRODUCT,
                    FilePurpose.GENERIC,
                    userId,
                );
            } catch (uploadError: any) {
                await this.standaloneProductModel.findByIdAndDelete(standaloneProduct._id).exec();
                throw uploadError;
            }

            return standaloneProduct;

        } catch (err: any) {
            throw new BadRequestException(
                'Error al crear el producto independiente: ' + err.message,
            );
        }
    }

    async findAll(){
        return this.standaloneProductModel
            .find()
            .populate('category')
            .populate('subcategory')
            .populate('owner')
            .populate('updatedBy')
            .exec();
    }

    async findByUser(userId: string){
        return this.standaloneProductModel
            .find({ owner: userId })
            .populate('category')
            .populate('subcategory')
            .populate('owner')
            .populate('updatedBy')
            .exec();
    }

    async findOne(id: string){
        const standaloneProduct = await this.standaloneProductModel
            .findById(id)
            .populate('category')
            .populate('subcategory')
            .populate('owner')
            .populate('updatedBy')
            .exec();
        if (!standaloneProduct) {
            throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
        }
        return standaloneProduct;
    }

    async update(
        id: string,
        updateStandaloneProductDto: UpdateStandaloneProductDto,
        userId: string,
        file?: Express.Multer.File,
    ){
        try{
            if (file) {
            const previousFiles = await this.filesService.findFilesForEntity(id);
            await this.filesService.deleteFiles(previousFiles);

            await this.filesService.uploadFile(
                file,
                id,
                EntityType.STANDALONE_PRODUCT,
                FilePurpose.GENERIC,
                userId,
            );
        }

            const updatedStandaloneProduct = await this.standaloneProductModel.findByIdAndUpdate(
                id,
                {
                    ...updateStandaloneProductDto,
                    updatedBy: userId,
                },
                { new: true },
            );

            if (!updatedStandaloneProduct) {
                throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
            }

            return {id, message: 'Producto independiente actualizado correctamente'};
        } catch (err: any) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new BadRequestException(
                'Error al actualizar el producto independiente: ' + err.message,
            );
        }
    }

    async remove(id: string){
        try{
            const standaloneProduct = await this.standaloneProductModel.findById(id).exec();

            if (!standaloneProduct) {
                throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
            }

            const files = await this.filesService.findFilesForEntity(id);
            await this.filesService.deleteFiles(files);

            await this.standaloneProductModel.findByIdAndDelete(id);

            return {id, message: 'Producto independiente eliminado correctamente'};
        } catch (err: any) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new BadRequestException(
                'Error al eliminar el producto independiente: ' + err.message,
            );
        }
    }
}
