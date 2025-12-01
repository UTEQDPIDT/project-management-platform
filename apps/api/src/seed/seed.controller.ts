import { Controller, Get, Param } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @ApiOkResponse({ description: 'Datos de seed poblados correctamente.'})
  @ApiBadRequestResponse({ description: 'Contraseña incorrecta.'})
  @Get(':password')
  runSeed(@Param('password') password: string) {
    return this.seedService.runSeed(password);
  }
}
