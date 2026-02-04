import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AbilitiesGuard } from '../casl/abilities.guard';
import { CheckAbilities } from '../casl/abilities.decorator';
import { Action } from '../casl/ability.factory';
import { User } from '../schemas/user.schema';
import { UserResourceInterceptor } from './interceptors/user-resource.interceptor';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: 'Usuario creado correctamente.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //ANY AUTHENTICATED USER
  @ApiOkResponse({ description: 'Lista de usuarios obtenida correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontraron usuarios.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  //ANY AUTHENTICATED USER
  @ApiOkResponse({ description: 'Usario existe en la base de datos.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  @Get('email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOkResponse({description: 'Regresa un objeto con los ids de usuario, correos y usuarios'})
  @Post('resolve-emails')
  async resolveEmails(@Body('emails') emails: string[]) {
    return this.usersService.resolveEmails(emails);
  }

  //SELF USER ONLY
  @ApiOkResponse({ description: 'Perfil de usuario obtenido correctamente.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.ReadSelf, subject: User })
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  //ANY AUTHENTICATED USER
  @ApiOkResponse({ description: 'Usuario obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //SELF USER ONLY
  @ApiOkResponse({ description: 'Usuario actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: User })
  @UseInterceptors(UserResourceInterceptor)
  @Patch(':id')
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.targetUser._id, updateUserDto);
  }

  //ADMIN ONLY
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiOkResponse({ description: 'Usuario eliminado correctamente.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: User })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
