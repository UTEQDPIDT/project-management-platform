import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AbilityFactory } from "./ability.factory";
import { Reflector } from "@nestjs/core/services/reflector.service";
import { CHECK_ABILITY_KEY, RequiredRule } from "./abilities.decorator";
import { ForbiddenError } from "@casl/ability";

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private abilityFactory: AbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const requiredRules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY_KEY, context.getHandler()) || [];
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const resource = request.resource;
        const ability = this.abilityFactory.defineAbility(user);

        try {
            requiredRules.forEach(({ action, subject }) => ForbiddenError.from(ability).throwUnlessCan(action, resource ?? subject));
            return true;
        } catch (error) {
            if (error instanceof ForbiddenError) {
            throw new ForbiddenException(error.message);
            }
        }
    }
}