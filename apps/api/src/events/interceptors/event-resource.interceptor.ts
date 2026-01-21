import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ForbiddenError } from '@casl/ability';
import { Event } from '../../schemas';
import { AbilityFactory, Action } from '../../casl/ability.factory';

@Injectable()
export class EventResourceInterceptor implements NestInterceptor {
    constructor(
        private readonly abilityFactory: AbilityFactory,
        @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        const eventId = req.params.id;
        if (!eventId) {
            return next.handle();
        }

        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const ability = this.abilityFactory.defineAbility(user);

        // Decide action based on HTTP method
        let action: Action | null = null;

        switch (req.method) {
            case 'PATCH':
            case 'PUT':
                action = Action.Update;
                break;
            case 'DELETE':
                action = Action.Delete;
                break;
        }

        if (action) {
            ForbiddenError.from(ability).throwUnlessCan(action, event);
        }

        req.event = event;
        return next.handle();
    }
}
