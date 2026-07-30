import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UserRole } from '@repo/types';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: UserRole;
  };
};

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiCreatedResponse({
    description: 'Actividad creada correctamente.',
    type: CreateActivityDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.activitiesService.create(
      createActivityDto,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Lista de actividades obtenida correctamente.',
    type: [CreateActivityDto],
  })
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.activitiesService.findAllVisibleTo(req.user.id, req.user.role);
  }

  @ApiAcceptedResponse({
    description: 'Actividades por entidad obtenidas correctamente.',
    type: [CreateActivityDto],
  })
  @ApiNotFoundResponse({ description: 'No se encontraron actividades.' })
  @Get('entity/:entityId')
  findByEntityId(
    @Param('entityId') entityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.activitiesService.findByEntityIdVisibleTo(
      entityId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Actividad obtenida correctamente.',
    type: CreateActivityDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.activitiesService.findOneVisibleTo(id, req.user.id, req.user.role);
  }

  @ApiAcceptedResponse({
    description: 'Actividad actualizado correctamente.',
    type: UpdateActivityDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.activitiesService.update(
      id,
      updateActivityDto,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Se asigno la actividad al usuario correctamente.',
  })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @Patch(':id/add-assignee')
  async addAssignee(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.activitiesService.addAssignee(
      id,
      userId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({
    description: 'Se retiro el usuario de la actividad correctamente.',
  })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @Patch(':id/remove-assignee')
  async removeAssignee(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.activitiesService.removeAssignee(
      id,
      userId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiAcceptedResponse({ description: 'Actividad eliminada correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.activitiesService.remove(id, req.user.id, req.user.role);
  }
}
