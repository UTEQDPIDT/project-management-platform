import { Injectable, NestInterceptor, ExecutionContext, CallHandler, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbilityFactory } from '../casl/ability.factory';
import { User } from '../schemas';
import { ForbiddenError } from '@casl/ability';
import { Action } from '../casl/ability.factory';

@Injectable()
export class UserResourceInterceptor implements NestInterceptor {
    constructor(
        private readonly abilityFactory: AbilityFactory,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        const ability = this.abilityFactory.defineAbility(req.user);

        const userId = req.params.id;
        const targetUser = await this.userModel.findById(userId);

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        ForbiddenError.from(ability).throwUnlessCan(
            Action.Update,
            targetUser,
        );

        req.targetUser = targetUser;
        return next.handle();
    }
}
