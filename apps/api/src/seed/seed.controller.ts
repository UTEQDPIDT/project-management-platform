import { Body, Controller, ForbiddenException, Post, Req } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserRole } from '@repo/types';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: UserRole;
  };
};

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  private ensureAdmin(req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden ejecutar operaciones de seed.',
      );
    }
  }

  @ApiOkResponse({ description: 'Datos de seed poblados correctamente.'})
  @ApiBadRequestResponse({ description: 'Contraseña incorrecta.'})
  @Post()
  runSeed(
    @Body('password') password: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.ensureAdmin(req);
    return this.seedService.runSeed(password);
  }

  @ApiOkResponse({ description: 'Índices de matrícula y número de empleado reparados correctamente.'})
  @ApiBadRequestResponse({ description: 'Contraseña incorrecta.'})
  @Post('fix-matricula-index')
  fixMatriculaIndex(
    @Body('password') password: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.ensureAdmin(req);
    return this.seedService.fixMatriculaIndex(password);
  }
}
