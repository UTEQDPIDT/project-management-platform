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
  create(@Body() createActivityDto: CreateActivityDto, @Req() req) {
    return this.activitiesService.create(createActivityDto, req.user.id);
  }

  @ApiAcceptedResponse({
    description: 'Lista de actividades obtenida correctamente.',
    type: [CreateActivityDto],
  })
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @ApiAcceptedResponse({
    description: 'Actividades por entidad obtenidas correctamente.',
    type: [CreateActivityDto],
  })
  @ApiNotFoundResponse({ description: 'No se encontraron actividades.' })
  @Get('entity/:entityId')
  findByEntityId(@Param('entityId') entityId: string) {
    return this.activitiesService.findByEntityId(entityId);
  }

  @ApiAcceptedResponse({
    description: 'Actividad obtenida correctamente.',
    type: CreateActivityDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
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
    @Req() req,
  ) {
    return this.activitiesService.update(id, updateActivityDto, req.user.id);
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
    @Req() req,
  ) {
    await this.activitiesService.addAssignee(id, userId, req.user.id);
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
    @Req() req,
  ) {
    await this.activitiesService.removeAssignee(id, userId, req.user.id);
  }

  @ApiAcceptedResponse({ description: 'Actividad eliminada correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
