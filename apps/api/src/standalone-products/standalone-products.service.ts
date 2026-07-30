import { 
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';

import { CreateStandaloneProductDto } from './dto/create-standalone-product.dto';
import { UpdateStandaloneProductDto } from './dto/update-standalone-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StandaloneProduct } from '../schemas/standalone-product.schema';
import { Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { EntityType, FilePurpose, UserRole } from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class StandaloneProductsService {
    constructor(
        @InjectModel(StandaloneProduct.name) private standaloneProductModel: Model<StandaloneProduct>,
        private readonly filesService: FilesService,
    ) {}

    private toId(value: unknown): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        if (typeof (value as { toString?: () => string }).toString === 'function') {
            return (value as { toString: () => string }).toString();
        }

        return null;
    }

    private ensureCanAccessStandaloneProduct(
        product: StandaloneProduct,
        actorId: string,
        actorRole: UserRole,
        reason: AccessDeniedReason,
        message: string,
    ) {
        const ownerId = this.toId(product.owner);

        if (!ownerId) {
            throw new AccessDeniedException({
                reason: AccessDeniedReason.PRODUCT_OWNER_MISSING,
                message: 'Standalone product owner is not defined.',
                resourceType: 'standalone-product',
                resourceId: product._id.toString(),
                actorId,
                actorRole,
            });
        }

        if (actorRole === UserRole.ADMIN || ownerId === actorId) {
            return;
        }

        throw new AccessDeniedException({
            reason,
            message,
            resourceType: 'standalone-product',
            resourceId: product._id.toString(),
            actorId,
            actorRole,
        });
    }

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

    async findAllVisibleTo(actorId: string, actorRole: UserRole){
        const products = await this.findAll();

        const visibleProducts = products.filter((product) => {
            try {
                this.ensureCanAccessStandaloneProduct(
                    product,
                    actorId,
                    actorRole,
                    AccessDeniedReason.STANDALONE_PRODUCT_VIEW_FORBIDDEN,
                    'You are not allowed to view this standalone product.',
                );
                return true;
            } catch {
                return false;
            }
        });

        return visibleProducts;
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

    async findByUserVisibleTo(userId: string, actorId: string, actorRole: UserRole){
        const products = await this.findByUser(userId);

        const visibleProducts = products.filter((product) => {
            try {
                this.ensureCanAccessStandaloneProduct(
                    product,
                    actorId,
                    actorRole,
                    AccessDeniedReason.STANDALONE_PRODUCT_VIEW_FORBIDDEN,
                    'You are not allowed to view this standalone product.',
                );
                return true;
            } catch {
                return false;
            }
        });

        return visibleProducts;
    }

    async findOne(id: string, actorId: string, actorRole: UserRole){
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

        this.ensureCanAccessStandaloneProduct(
            standaloneProduct,
            actorId,
            actorRole,
            AccessDeniedReason.STANDALONE_PRODUCT_VIEW_FORBIDDEN,
            'You are not allowed to view this standalone product.',
        );

        return standaloneProduct;
    }

    async update(
        id: string,
        updateStandaloneProductDto: UpdateStandaloneProductDto,
        userId: string,
        userRole: UserRole,
        file?: Express.Multer.File,
    ){
        try{
            const standaloneProduct = await this.standaloneProductModel.findById(id).exec();

            if (!standaloneProduct) {
                throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
            }

            this.ensureCanAccessStandaloneProduct(
                standaloneProduct,
                userId,
                userRole,
                AccessDeniedReason.STANDALONE_PRODUCT_MANAGE_FORBIDDEN,
                'You are not allowed to update this standalone product.',
            );

            if (file) {
                const previousFiles = await this.filesService.findFilesForEntity(id);
                await this.filesService.deleteFilesForResource(previousFiles);

                await this.filesService.uploadFile(
                    file,
                    id,
                    EntityType.STANDALONE_PRODUCT,
                    FilePurpose.GENERIC,
                    userId,
                    userRole,
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
            if (err instanceof NotFoundException || err instanceof ForbiddenException) {
                throw err;
            }
            throw new BadRequestException(
                'Error al actualizar el producto independiente: ' + err.message,
            );
        }
    }

    async remove(id: string, actorId: string, actorRole: UserRole){
        try{
            const standaloneProduct = await this.standaloneProductModel.findById(id).exec();

            if (!standaloneProduct) {
                throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
            }

            this.ensureCanAccessStandaloneProduct(
                standaloneProduct,
                actorId,
                actorRole,
                AccessDeniedReason.STANDALONE_PRODUCT_MANAGE_FORBIDDEN,
                'You are not allowed to delete this standalone product.',
            );

            const files = await this.filesService.findFilesForEntity(id);
            await this.filesService.deleteFilesForResource(files);

            await this.standaloneProductModel.findByIdAndDelete(id);

            return {id, message: 'Producto independiente eliminado correctamente'};
        } catch (err: any) {
            if (err instanceof NotFoundException || err instanceof ForbiddenException) {
                throw err;
            }
            throw new BadRequestException(
                'Error al eliminar el producto independiente: ' + err.message,
            );
        }
    }
}
