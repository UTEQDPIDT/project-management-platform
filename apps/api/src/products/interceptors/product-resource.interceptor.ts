import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ForbiddenError } from '@casl/ability';
import { ProductsService } from '../products.service';
import { ProjectsService } from '../../projects/projects.service';
import { AbilityFactory, Action } from '../../casl/ability.factory';

@Injectable()
export class ProductResourceInterceptor implements NestInterceptor {
    constructor(
        private readonly productsService: ProductsService,
        private readonly projectsService: ProjectsService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.abilityFactory.defineAbility(user);

        const productId = req.params.id;
        if (!productId) {
        // POST /products → no resource yet
            return next.handle();
        }

        // 1. Load product
        const product = await this.productsService.findOne(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // 2. Load project
        const project = await this.projectsService.findOne(product.projectId.toString());

        if (!project) {
            throw new NotFoundException('Project not found for product');
        }

        if (!project.team) {
            throw new ForbiddenException('Project has no team assigned');
        }

        // 3. Resolve CASL action
        const action = this.resolveAction(req);

        // 4. Authorize against TEAM
        ForbiddenError.from(ability).throwUnlessCan(action, project.team);

        return next.handle();
    }

    private resolveAction(req: any): Action {
        switch (req.method) {
        case 'POST':
            return Action.Create;
        case 'PATCH':
            return Action.Update;
        case 'DELETE':
            return Action.Delete;
        case 'GET':
        default:
            return Action.Read;
        }
    }
}
