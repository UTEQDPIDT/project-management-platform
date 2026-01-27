import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ForbiddenError } from '@casl/ability';
import { FilesService } from '../files.service';
import { ProjectsService } from '../../projects/projects.service';
import { EventsService } from '../../events/events.service';
import { ActivitiesService } from '../../activities/activities.service';
import { ProductsService } from '../../products/products.service';
import { AbilityFactory, Action } from '../../casl/ability.factory';
import { EntityType } from '@repo/types';

@Injectable()
export class FileResourceInterceptor implements NestInterceptor {
    constructor(
        private readonly filesService: FilesService,
        private readonly projectsService: ProjectsService,
        private readonly eventsService: EventsService,
        private readonly activitiesService: ActivitiesService,
        private readonly productsService: ProductsService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const ability = this.abilityFactory.defineAbility(user);

        // UPLOAD (no fileId yet)
        if (!req.params?.id) {
        const { entityId, entityType } = req.body;

        if (!entityId || !entityType) {
            throw new ForbiddenException('Missing entity reference');
        }

        // Uploading files = adding content
        const action = Action.UpdateContent;

        await this.authorizeByEntity(entityType, entityId, action, ability);
        return next.handle();
        }

        // EXISTING FILE
        const file = await this.filesService.getFileMetadata(req.params.id);
        if (!file) {
        throw new NotFoundException('File not found');
        }

        const action = this.resolveAction(req);

        await this.authorizeByEntity(
        file.entityType,
        file.entityId.toString(),
        action,
        ability,
        );

        return next.handle();
    }

    private async authorizeByEntity(
        entityType: EntityType,
        entityId: string,
        action: Action,
        ability: any,
    ) {
        switch (entityType) {
        case EntityType.PROJECT: {
            const project = await this.projectsService.findOne(entityId);
            if (!project?.team) {
            throw new NotFoundException('Project or team not found');
            }

            ForbiddenError.from(ability).throwUnlessCan(action, project.team);
            return;
        }

        case EntityType.EVENT: {
            const event = await this.eventsService.findOne(entityId);
            if (!event) {
            throw new NotFoundException('Event not found');
            }

            ForbiddenError.from(ability).throwUnlessCan(action, event);
            return;
        }

        case EntityType.ACTIVITY: {
            const activity = await this.activitiesService.findOne(entityId);
            if (!activity) {
            throw new NotFoundException('Activity not found');
            }

            // Inherit permissions from parent entity
            return this.authorizeByEntity(
            activity.entityType,
            activity.entityId.toString(),
            action,
            ability,
            );
        }

        case EntityType.PRODUCT: {
            const product = await this.productsService.findOne(entityId);
            if (!product?.projectId) {
            throw new NotFoundException('Product project not found');
            }

            const project = await this.projectsService.findOne(
            product.projectId.toString(),
            );

            if (!project?.team) {
            throw new NotFoundException('Product project or team not found');
            }

            ForbiddenError.from(ability).throwUnlessCan(action, project.team);
            return;
        }

        default:
            throw new ForbiddenException('Invalid file entity type');
        }
    }

    private resolveAction(req: any): Action {
        if (req.method === 'DELETE') {
        return Action.Manage; // deleting files = management
        }

        if (req.method === 'POST') {
        return Action.UpdateContent;
        }

        return Action.Read;
    }
}
