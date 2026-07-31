import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { UserRole } from '@repo/types';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: UserRole;
  };
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: 'Usuario creado correctamente.' })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden crear usuarios.',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden crear usuarios.',
      );
    }

    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({ description: 'Lista de usuarios obtenida correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontraron usuarios.' })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden listar usuarios.',
  })
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden listar usuarios.',
      );
    }

    return this.usersService.findAll();
  }

  @ApiOkResponse({ description: 'Usario existe en la base de datos.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden buscar por correo.',
  })
  @Get('email')
  findByEmail(@Query('email') email: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden buscar por correo.',
      );
    }

    return this.usersService.findByEmail(email);
  }

  @ApiOkResponse({
    description: 'Regresa un objeto con los ids de usuario, correos y usuarios',
  })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden resolver correos.',
  })
  @Post('resolve-emails')
  async resolveEmails(
    @Body('emails') emails: string[],
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden resolver correos.',
      );
    }

    return this.usersService.resolveEmails(emails);
  }

  @ApiOkResponse({ description: 'Perfil de usuario obtenido correctamente.' })
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiOkResponse({
    description: 'Lista de usuarios para selector de integrantes obtenida correctamente.',
  })
  @Get('team-picker')
  findAllForTeamPicker() {
    return this.usersService.findAllForTeamPicker();
  }

  @ApiOkResponse({ description: 'Usario obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException(
        'Solo puedes ver tu propio perfil o debes ser administrador.',
      );
    }

    return this.usersService.findOne(id);
  }

  @ApiOkResponse({ description: 'Usuario actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const canEditUser = req.user.id === id || req.user.role === UserRole.ADMIN;

    if (!canEditUser) {
      throw new ForbiddenException(
        'Solo puedes editar tu propio perfil o debes ser administrador.',
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @ApiOkResponse({ description: 'Accesos del usuario actualizados correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden cambiar roles o permisos.',
  })
  @Patch(':id/access')
  async updateAccess(
    @Param('id') id: string,
    @Body() updateUserAccessDto: UpdateUserAccessDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden cambiar roles o permisos.',
      );
    }

    const requester = await this.usersService.findOne(req.user.id);

    if (!requester.canCloseProject) {
      throw new ForbiddenException(
        'No tienes permiso para cambiar roles o permisos de acceso.',
      );
    }

    return this.usersService.updateAccess(id, updateUserAccessDto);
  }

  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiForbiddenResponse({
    description: 'Solo los administradores pueden eliminar usuarios.',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden eliminar usuarios.',
      );
    }

    return this.usersService.remove(id);
  }
}
