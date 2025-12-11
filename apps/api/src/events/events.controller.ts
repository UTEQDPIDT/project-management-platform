import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  create(@Body() createEventDto: CreateEventDto, @Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.eventsService.create(createEventDto, req.user.id, file);
  }

  @ApiCreatedResponse({ description: 'Participantes agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Usuario no encontrado / ya es participante' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/participants')
  addParticipants(@Param('id') id: string, @Body('userIds') userIds: string[], @Req() req) {
    return this.eventsService.addParticipants(id, userIds, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Archivo de reporte subido correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/report-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  uploadReportFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.eventsService.uploadReportFile(id, file, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Actividades agregadas correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada o no es válida.' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/activities')
  addActivities(@Param('id') id: string, @Body('activityIds') activityIds: string[], @Req() req) {
    return this.eventsService.addActivities(id, activityIds, req.user.id);
  }

  @ApiCreatedResponse({ description: 'Productos agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado o no es válido.' })
  @UseGuards(JwtAuthGuard)
  @Post(':id/products')
  addProducts(@Param('id') id: string, @Body('productIds') productIds: string[], @Req() req) {
    return this.eventsService.addProducts(id, productIds, req.user.id);
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id/participants/:userId/remove')
  removeParticipant(@Param('id') id: string, @Param('userId') userId: string, @Req() req) {
    return this.eventsService.removeParticipant(id, userId, req.user.id);
  }

  @ApiOkResponse({ description: 'Archivo de reporte eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El archivo no existe en el evento.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/report-file/remove')
  removeReportFile(@Param('id') id: string, @Req() req) {
    return this.eventsService.removeReportFile(id, req.user.id);
  }

  @ApiOkResponse({ description: 'Actividad eliminada correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Actividad no encontrada en el evento.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/activities/:activityId/remove')
  removeActivity(@Param('id') id: string, @Param('activityId') activityId: string, @Req() req) {
    return this.eventsService.removeActivity(id, activityId, req.user.id);
  }

  @ApiOkResponse({ description: 'Producto eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado en el evento.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/products/:productId/remove')
  removeProduct(@Param('id') id: string, @Param('productId') productId: string, @Req() req) {
    return this.eventsService.removeProduct(id, productId, req.user.id);
  }
}
