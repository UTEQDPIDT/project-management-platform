import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiAcceptedResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AbilitiesGuard } from '../casl/abilities.guard';
import { CheckAbilities } from '../casl/abilities.decorator';
import { Action } from '../casl/ability.factory';
import { Activity } from '../schemas/activities.schema';
import { ActivityResourceInterceptor } from './interceptors/activity-resource.interceptor';
import { User } from '../schemas';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  //ONLY AUTHENTICATED USERS WITH CREATE ABILITY
  @ApiCreatedResponse({ description: 'Actividad creada correctamente.', type: CreateActivityDto })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: Activity })
  @Post()
  create(@Body() createActivityDto: CreateActivityDto, @Req() req: { user: User }) {
    return this.activitiesService.create(createActivityDto, req.user);
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({ description: 'Lista de actividades obtenida correctamente.', type: [CreateActivityDto] })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Activity})
  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }
  
  //ANY USER THAT CAN READ ACTIVITIES FOR A GIVEN ENTITY
  @ApiAcceptedResponse({ description: 'Actividades por entidad obtenidas correctamente.', type: [CreateActivityDto] })
  @ApiNotFoundResponse({ description: 'No se encontraron actividades.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ActivityResourceInterceptor)
  @Get('entity/:entityId')
  findByEntityId(@Param('entityId') entityId: string) {
    return this.activitiesService.findByEntityId(entityId);
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({ description: 'Actividad obtenida correctamente.', type: CreateActivityDto })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Activity})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  //ONLY USERS THAT CAN UPDATE THE ACTIVITY'S RELATED ENTITY
  @ApiAcceptedResponse({ description: 'Actividad actualizado correctamente.', type: UpdateActivityDto })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ActivityResourceInterceptor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto, @Req() req) {
    return this.activitiesService.update(id, updateActivityDto, req.user.id);
  }

  //ONLY USERS THAT CAN UPDATE CONTENT FROM THE ACTIVITY'S RELATED ENTITY
  @ApiAcceptedResponse({ description: 'Se asigno la actividad al usuario correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ActivityResourceInterceptor)
  @Patch(':id/add-assignee')
  addAssignee(@Param('id') id: string, @Body('userId') userId: string, @Req() req) {
    this.activitiesService.addAssignee(id, userId, req.user.id);
  }

  //ONLY USERS THAT CAN UPDATE CONTENT FROM THE ACTIVITY'S RELATED ENTITY
  @ApiAcceptedResponse({description: 'Se retiro el usuario de la actividad correctamente.'})
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ActivityResourceInterceptor)
  @Patch(':id/remove-assignee')
  removeAssignee(@Param('id') id: string, @Body('userId') userId: string, @Req() req) {
    this.activitiesService.removeAssignee(id, userId, req.user.id);
  }

  //ONLY USERS THAT CAN MANAGE THE ACTIVITY
  @ApiAcceptedResponse({ description: 'Actividad eliminada correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro la actividad.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ActivityResourceInterceptor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
