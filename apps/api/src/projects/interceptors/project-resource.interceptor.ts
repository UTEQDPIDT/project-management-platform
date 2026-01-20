import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from "@nestjs/common";
import { AbilityFactory, Action } from "../../casl/ability.factory";
import { Project } from "../../schemas";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ForbiddenError } from "@casl/ability";

@Injectable()
export class ProjectResourceInterceptor implements NestInterceptor {
    constructor(
        private readonly abilityFactory: AbilityFactory,
        @InjectModel(Project.name) private projectModel: Model<Project>,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        const ability = this.abilityFactory.defineAbility(req.user);

        const projectId = req.params.id;
        const project = await this.projectModel.findById(projectId);

        if (!project) {
            throw new NotFoundException();
        }

        ForbiddenError.from(ability).throwUnlessCan(
            req.method === 'DELETE' ? Action.Delete : Action.Update,
            project,
        );

        req.project = project;
        return next.handle();
    }
}
