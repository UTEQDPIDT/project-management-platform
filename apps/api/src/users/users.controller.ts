import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: 'Usuario creado correctamente.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({ description: 'Lista de usuarios obtenida correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontraron usuarios.' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOkResponse({ description: 'Usario existe en la base de datos.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @Get('email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOkResponse({
    description: 'Regresa un objeto con los ids de usuario, correos y usuarios',
  })
  @Post('resolve-emails')
  async resolveEmails(@Body('emails') emails: string[]) {
    return this.usersService.resolveEmails(emails);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiOkResponse({ description: 'Usario obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOkResponse({ description: 'Usuario actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @ApiUnauthorizedResponse({ description: 'Las credenciales son incorrectas.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiNotFoundResponse({ description: 'No se encontro al usuario.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
