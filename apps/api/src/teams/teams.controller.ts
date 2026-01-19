import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseBoolPipe, UseInterceptors } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AbilitiesGuard } from '../casl/abilities.guard';
import { TeamResourceInterceptor } from './interceptors/team-resource.interceptor';
import { Action } from '../casl/ability.factory';
import { CheckAbilities } from '../casl/abilities.decorator';
import { Team } from '../schemas/team.schema';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  //ANY AUTHENTICATED USER
  @ApiCreatedResponse({ description: 'Equipo creado correctamente.' })
  @Post()
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: Team })
  create(@Body() createTeamDto: CreateTeamDto, @Req() req) {
    return this.teamsService.create(createTeamDto, req.user.id);
  }

  //OWNER ONLY
  @ApiCreatedResponse({description: 'Colaborador agregado correctamente al equipo.'})
  @ApiNotFoundResponse({description: 'No se encontró el usuario para agregar como colaborador.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Post(':id/collaborators')
  addCollaborator(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.teamsService.addCollaborators(id, userIds);
  }

  //OWNER ONLY
  @ApiCreatedResponse({description: 'Miembro agregado correctamente al equipo.'})
  @ApiNotFoundResponse({description: 'No se encontró el usuario para agregar como miembro.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.teamsService.addMembers(id, userIds);
  }

  //ANY AUTHENTICATED USER
  @ApiCreatedResponse({description: 'Solicitud enviada correctamente al equipo.'})
  @ApiNotFoundResponse({description: 'No se encontró el usuario para enviar la solicitud.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: Team })
  @Post(':id/requests')
  sendRequest(@Param('id') id: string, @Req() req) {
    return this.teamsService.sendTeamRequest(id, req.user.id);
  }

  //OWNER ONLY
  @ApiCreatedResponse({ description: 'Solicitud aceptada correctamente.'})
  @ApiNotFoundResponse({description: 'No se encontró la solicitud.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Post(':id/requests/accept')
  acceptRequest(@Param('id') id: string, @Body('userId') userId: string) {
    return this.teamsService.acceptRequest(id, userId);
  }

  //OWNER ONLY
  @ApiCreatedResponse({ description: 'Solicitud rechazada correctamente.' })
  @ApiNotFoundResponse({description: 'No se encontró la solicitud.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Delete(':id/requests/:userId')
  rejectRequest(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.rejectRequest(id, userId);
  }

  //OWNER, MEMBERS & COLLABORATORS ONLY
  @ApiOkResponse({ description: 'Lista de equipos obtenida correctamente.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Read, subject: Team })
  @Get()
  findAll(@Req() req, @Query('isPrivate', new ParseBoolPipe({ optional: true })) isPrivate?: boolean) {
    return this.teamsService.findAll({ userId: req.user.id, isPrivate });
  }

  //OWNER, MEMBERS & COLLABORATORS ONLY
  @ApiOkResponse({ description: 'Lista de equipos obtenida correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Cookie expirada' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Read, subject: Team })
  @Get('by-user')
  findByUser(@Req() req) {
    return this.teamsService.findByUser(req.user.id);
  }

  //OWNER, MEMBERS & COLLABORATORS ONLY
  @ApiOkResponse({ description: 'Equipo obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Read, subject: Team })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  //OWNER & MEMBERS ONLY
  @ApiOkResponse({ description: 'Datos del equipo actualizado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Update, subject: Team })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, updateTeamDto);
  }

  //OWNER ONLY
  @ApiOkResponse({description: 'Colaborador eliminado correctamente del equipo.'})
  @ApiNotFoundResponse({description: 'No se encontró el colaborador en el equipo.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Delete(':id/collaborators/:userId')
  removeCollaborator(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeCollaborator(id, userId);
  }

  //OWNER ONLY
  @ApiOkResponse({ description: 'Miembro eliminado correctamente del equipo.' })
  @ApiNotFoundResponse({description: 'No se encontró el miembro en el equipo.'})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }

  //OWNER ONLY
  @ApiOkResponse({ description: 'Equipo eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontró el equipo.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(TeamResourceInterceptor)
  @CheckAbilities({ action: Action.Manage, subject: Team })
  @Delete(':id')
  deleteTeam(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }
}
