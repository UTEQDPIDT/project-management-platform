import { CanActivate, ExecutionContext, ForbiddenException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { AbilityFactory } from "./ability.factory";
import { Reflector } from "@nestjs/core/services/reflector.service";
import { CHECK_ABILITY_KEY, RequiredRule } from "./abilities.decorator";
import { ForbiddenError } from "@casl/ability";
import { UsersService } from "../users/users.service";

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private abilityFactory: AbilityFactory,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const requiredRules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY_KEY, context.getHandler()) || [];
        const request = context.switchToHttp().getRequest();
        let user = request.user;

        if (user && !user.role)
            user = await this.usersService.findOne(user.id);

        const resource = request.resource;
        const ability = this.abilityFactory.defineAbility(user);

        try {
            requiredRules.forEach(({ action, subject }) => {
                const target = resource || subject;
                ForbiddenError.from(ability).throwUnlessCan(action, target);
            });
            return true;
        } catch (error) {
            if (error instanceof ForbiddenError) {
            throw new ForbiddenException(error.message);
            }
        }
    }
}