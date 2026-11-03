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
import { Team } from '../schemas/team.schema';
import { Model } from 'mongoose';
import { FilesService } from '../files/files.service';
import { EntityType, FilePurpose, UserRole } from '@repo/types';
import { AccessDeniedException } from '../common/security/access-denied.exception';
import { AccessDeniedReason } from '../common/security/access-denied-reason.enum';

@Injectable()
export class StandaloneProductsService {
    constructor(
        @InjectModel(StandaloneProduct.name) private standaloneProductModel: Model<StandaloneProduct>,
        @InjectModel(Team.name) private teamModel: Model<Team>,
        private readonly filesService: FilesService,
    ) {}

    private activeMembershipMatch(userId: string) {
        return {
            $elemMatch: {
                user: userId,
                $or: [
                    { status: 'ACTIVE' },
                    { status: { $regex: /^active$/i } },
                    { status: { $exists: false } },
                ],
            },
        };
    }

    private async isActiveTeamMember(teamId: string, userId: string) {
        const exists = await this.teamModel.exists({
            _id: teamId,
            memberships: this.activeMembershipMatch(userId),
        });
        return !!exists;
    }

    // Only admins may link a product to a team they do not belong to.
    private async ensureCanLinkTeam(teamId: string, actorId: string, actorRole: UserRole) {
        if (actorRole === UserRole.ADMIN) {
            return;
        }

        if (!(await this.isActiveTeamMember(teamId, actorId))) {
            throw new ForbiddenException('You are not allowed to link products to this team.');
        }
    }

    private async canView(product: StandaloneProduct, actorId: string, actorRole: UserRole) {
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
            const teamId = this.toId(product.team);
            return teamId ? this.isActiveTeamMember(teamId, actorId) : false;
        }
    }

    private toId(value: unknown): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        // Populated documents expose their id through _id; toString() would return the whole document.
        const populatedId = (value as { _id?: unknown })._id;
        if (populatedId !== null && populatedId !== undefined) {
            return populatedId.toString();
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
        actorRole: UserRole = UserRole.USER,
    ){
        try{
            if (!file) {
                throw new BadRequestException('No se proporciono un archivo para el producto independiente');
            }

            const { team, ...productData } = createStandaloneProductDto;

            if (team) {
                await this.ensureCanLinkTeam(team, userId, actorRole);
            }

            const standaloneProduct = new this.standaloneProductModel({
                ...productData,
                ...(team ? { team } : {}),
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

    private populateProduct<T extends { populate: (path: any) => T }>(query: T): T {
        return query
            .populate('category')
            .populate('subcategory')
            .populate('owner')
            .populate('updatedBy')
            .populate({ path: 'team', populate: [{ path: 'memberships.user' }] });
    }

    async findAll(){
        return this.populateProduct(this.standaloneProductModel.find()).exec();
    }

    async findAllVisibleTo(actorId: string, actorRole: UserRole){
        const products = await this.findAll();
        return this.filterVisible(products, actorId, actorRole);
    }

    private async filterVisible(
        products: StandaloneProduct[],
        actorId: string,
        actorRole: UserRole,
    ) {
        const visibility = await Promise.all(
            products.map((product) => this.canView(product, actorId, actorRole)),
        );
        return products.filter((_, index) => visibility[index]);
    }

    async findByUser(userId: string){
        return this.populateProduct(
            this.standaloneProductModel.find({ owner: userId }),
        ).exec();
    }

    async findByUserVisibleTo(userId: string, actorId: string, actorRole: UserRole){
        const products = await this.findByUser(userId);
        return this.filterVisible(products, actorId, actorRole);
    }

    async findByTeam(teamId: string, actorId: string, actorRole: UserRole){
        if (actorRole !== UserRole.ADMIN && !(await this.isActiveTeamMember(teamId, actorId))) {
            throw new AccessDeniedException({
                reason: AccessDeniedReason.STANDALONE_PRODUCT_VIEW_FORBIDDEN,
                message: 'You are not allowed to view standalone products from this team.',
                resourceType: 'standalone-product-team',
                resourceId: teamId,
                actorId,
                actorRole,
            });
        }

        return this.populateProduct(
            this.standaloneProductModel.find({ team: teamId }),
        ).exec();
    }

    async findOne(id: string, actorId: string, actorRole: UserRole){
        const standaloneProduct = await this.populateProduct(
            this.standaloneProductModel.findById(id),
        ).exec();
        if (!standaloneProduct) {
            throw new NotFoundException(`Producto independiente con ID ${id} no encontrado`);
        }

        if (!(await this.canView(standaloneProduct, actorId, actorRole))) {
            throw new AccessDeniedException({
                reason: AccessDeniedReason.STANDALONE_PRODUCT_VIEW_FORBIDDEN,
                message: 'You are not allowed to view this standalone product.',
                resourceType: 'standalone-product',
                resourceId: standaloneProduct._id.toString(),
                actorId,
                actorRole,
            });
        }

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

            const { team, ...productData } = updateStandaloneProductDto;

            if (team) {
                await this.ensureCanLinkTeam(team, userId, userRole);
            }

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
                    ...productData,
                    ...(team ? { team } : {}),
                    ...(team === '' ? { $unset: { team: 1 } } : {}),
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
