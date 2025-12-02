import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @ApiCreatedResponse({ description: 'Participantes agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Usuario no encontrado / ya es participante' })
  @Post(':id/participants')
  addParticipants(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    //return this.eventsService.addParticipants(id, userIds);
  }

  @ApiCreatedResponse({ description: 'Archivo de reporte subido correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Archivo no encontrado o no es válido.' })
  @Post(':id/report-file')
  uploadReportFile(@Param('id') id: string, @Body('fileId') fileId: string) {
    // return this.eventsService.uploadReportFile(id, fileId);
  }

  @ApiCreatedResponse({ description: 'Actividades agregadas correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada o no es válida.' })
  @Post(':id/activities')
  addActivities(@Param('id') id: string, @Body('activityIds') activityIds: string[]) {
    // return this.eventsService.addActivities(id, activityIds);
  }

  @ApiCreatedResponse({ description: 'Productos agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado o no es válido.' })
  @Post(':id/products')
  addProducts(@Param('id') id: string, @Body('productIds') productIds: string[]) {
    // return this.eventsService.addProducts(id, productIds);
  }

  @ApiOkResponse({ description: 'Lista de eventos obtenida correctamente.' })
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @ApiOkResponse({ description: 'Evento obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @ApiOkResponse({ 
    description: 'Evento actualizado correctamente.',
    type: UpdateEventDto
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @ApiOkResponse({ description: 'Evento eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @ApiOkResponse({ description: 'Participante eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El usuario no es participante en el evento.' })
  @Delete(':id/participants/:userId/remove')
  removeParticipant(@Param('id') id: string, @Param('userId') userId: string) {
    // return this.eventsService.removeParticipant(id, userId);
  }

  @ApiOkResponse({ description: 'Archivo de reporte eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El archivo no existe en el evento.' })
  @Delete(':id/report-file/remove')
  removeReportFile(@Param('id') id: string, @Body('fileId') fileId: string) {
    // return this.eventsService.removeReportFile(id, fileId);
  }

  @ApiOkResponse({ description: 'Actividad eliminada correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada en el evento.' })
  @Delete(':id/activities/:activityId/remove')
  removeActivity(@Param('id') id: string, @Param('activityId') activityId: string) {
    // return this.eventsService.removeActivity(id, activityId);
  }
}
