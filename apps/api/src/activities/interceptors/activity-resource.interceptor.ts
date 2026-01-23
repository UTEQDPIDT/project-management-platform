import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivitiesService } from '../activities.service';
import { EventsService } from '../../events/events.service';
import { ProjectsService } from '../../projects/projects.service';
import { AbilityFactory, Action } from '../../casl/ability.factory';
import { EntityType } from '@repo/types';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class ActivityResourceInterceptor implements NestInterceptor {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly eventsService: EventsService,
    private readonly projectsService: ProjectsService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ability = this.abilityFactory.defineAbility(user);

    const activityId = req.params.id;
    if (!activityId) {
      return next.handle();
    }

    const activity = await this.activitiesService.findOne(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const action = this.resolveAction(req);

    //EVENT activity
    if (activity.entityType === EntityType.EVENT) {
      const event = await this.eventsService.findOne(
        activity.entityId.toString(),
      );

      ForbiddenError.from(ability).throwUnlessCan(action, event);
      return next.handle();
    }

    //PROJECT activity
    if (activity.entityType === EntityType.PROJECT) {
      const project = await this.projectsService.findOne(
        activity.entityId.toString(),
      );

      if (!project.team) {
        throw new ForbiddenException('Project has no team associated');
      }
      ForbiddenError.from(ability).throwUnlessCan(action, project.team);
      return next.handle();
    }

    throw new ForbiddenException('Invalid activity entity type');
  }

  private resolveAction(req: any): Action {
    if (req.route.path.includes('add-assignee')) {
      return Action.UpdateContent;
    }

    if (req.route.path.includes('remove-assignee')) {
      return Action.UpdateContent;
    }

    switch (req.method) {
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
