import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';
import { AbilitiesGuard } from './abilities.guard';

@Module({
    providers: [AbilityFactory, AbilitiesGuard],
    exports: [AbilityFactory, AbilitiesGuard],
})
export class CaslModule {}
