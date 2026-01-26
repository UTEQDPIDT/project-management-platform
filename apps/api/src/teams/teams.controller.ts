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
  ParseBoolPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiCreatedResponse({ description: 'Equipo creado correctamente.' })
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Req() req) {
    return this.teamsService.create(createTeamDto, req.user.id);
  }

  @ApiCreatedResponse({
    description: 'Colaborador agregado correctamente al equipo.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el usuario para agregar como colaborador.',
  })
  @Post(':id/collaborators')
  addCollaborator(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.teamsService.addCollaborators(id, userIds);
  }

  @ApiCreatedResponse({
    description: 'Miembro agregado correctamente al equipo.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el usuario para agregar como miembro.',
  })
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.teamsService.addMembers(id, userIds);
  }

  @ApiCreatedResponse({
    description: 'Solicitud enviada correctamente al equipo.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el usuario para enviar la solicitud.',
  })
  @Post(':id/requests')
  sendRequest(@Param('id') id: string, @Req() req) {
    return this.teamsService.sendTeamRequest(id, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Solicitud aceptada correctamente.' })
  @ApiNotFoundResponse({
    description: 'No se encontró la solicitud.',
  })
  @Post(':id/requests/accept')
  acceptRequest(@Param('id') id: string, @Body('userId') userId: string) {
    return this.teamsService.acceptRequest(id, userId);
  }

  @ApiCreatedResponse({ description: 'Solicitud rechazada correctamente.' })
  @ApiNotFoundResponse({
    description: 'No se encontró la solicitud.',
  })
  @Delete(':id/requests/:userId')
  rejectRequest(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.rejectRequest(id, userId);
  }

  @ApiOkResponse({ description: 'Lista de equipos obtenida correctamente.' })
  @Get()
  findAll(
    @Req() req,
    @Query('isPrivate', new ParseBoolPipe({ optional: true }))
    isPrivate?: boolean,
  ) {
    return this.teamsService.findAll({ userId: req.user.id, isPrivate });
  }

  @ApiOkResponse({ description: 'Lista de equipos obtenida correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Cookie expirada' })
  @Get('by-user')
  findByUser(@Req() req) {
    return this.teamsService.findByUser(req.user.id);
  }

  @ApiOkResponse({ description: 'Equipo obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @ApiOkResponse({ description: 'Datos del equipo actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, updateTeamDto);
  }

  @ApiOkResponse({
    description: 'Colaborador eliminado correctamente del equipo.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el colaborador en el equipo.',
  })
  @Delete(':id/collaborators/:userId')
  removeCollaborator(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeCollaborator(id, userId);
  }

  @ApiOkResponse({ description: 'Miembro eliminado correctamente del equipo.' })
  @ApiNotFoundResponse({
    description: 'No se encontró el miembro en el equipo.',
  })
  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }

  @ApiOkResponse({ description: 'Equipo eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @Delete(':id')
  deleteTeam(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }
}
