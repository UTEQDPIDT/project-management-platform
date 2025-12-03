import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Participantes agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Usuario no encontrado / ya es participante' })
  @Post(':id/participants')
  addParticipants(@Param('id') id: string, @Body('userIds') userIds: string[]) {
    return this.eventsService.addParticipants(id, userIds);
  }

  @ApiCreatedResponse({ description: 'Archivo de reporte subido correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/report-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadReportFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.eventsService.uploadReportFile(id, file, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Actividades agregadas correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada o no es válida.' })
  @Post(':id/activities')
  addActivities(@Param('id') id: string, @Body('activityIds') activityIds: string[]) {
    return this.eventsService.addActivities(id, activityIds);
  }

  @ApiCreatedResponse({ description: 'Productos agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado o no es válido.' })
  @Post(':id/products')
  addProducts(@Param('id') id: string, @Body('productIds') productIds: string[]) {
    return this.eventsService.addProducts(id, productIds);
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
    return this.eventsService.findOne(id);
  }

  @ApiOkResponse({ 
    description: 'Evento actualizado correctamente.',
    type: UpdateEventDto
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Req() req) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @ApiOkResponse({ description: 'Evento eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @ApiOkResponse({ description: 'Participante eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El usuario no es participante en el evento.' })
  @Delete(':id/participants/:userId/remove')
  removeParticipant(@Param('id') id: string, @Param('userId') userId: string) {
    return this.eventsService.removeParticipant(id, userId);
  }

  @ApiOkResponse({ description: 'Archivo de reporte eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El archivo no existe en el evento.' })
  @Delete(':id/report-file/remove')
  removeReportFile(@Param('id') id: string) {
    return this.eventsService.removeReportFile(id);
  }

  @ApiOkResponse({ description: 'Actividad eliminada correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada en el evento.' })
  @Delete(':id/activities/:activityId/remove')
  removeActivity(@Param('id') id: string, @Param('activityId') activityId: string) {
    return this.eventsService.removeActivity(id, activityId);
  }

  @ApiOkResponse({ description: 'Producto eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado en el evento.' })
  @Delete(':id/products/:productId/remove')
  removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.eventsService.removeProduct(id, productId);
  }
}
