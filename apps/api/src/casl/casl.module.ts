import { forwardRef, Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { AbilitiesGuard } from './abilities.guard';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [forwardRef(() => UsersModule)],
    providers: [AbilityFactory, AbilitiesGuard],
    exports: [AbilityFactory, AbilitiesGuard],
})
export class CaslModule {}
