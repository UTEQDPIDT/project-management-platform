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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateActivityDto } from '../activities/dto/create-activity.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('report'))
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req,
    @UploadedFile() report: Express.Multer.File,
  ) {
    return this.eventsService.create(createEventDto, req.user.id, report);
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
    type: UpdateEventDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req,
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @ApiOkResponse({ description: 'Evento eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  /**
   * REPORT
   */
  @ApiCreatedResponse({
    description: 'Archivo de reporte subido correctamente al evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('report'))
  @Patch(':id/report-file')
  uploadReportFile(
    @Param('id') id: string,
    @UploadedFile() report: Express.Multer.File,
    @Req() req,
  ) {
    return this.eventsService.uploadReportFile(id, report, req.user.id);
  }

  @ApiOkResponse({
    description: 'Archivo de reporte eliminado correctamente del evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El archivo no existe en el evento.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/report-file')
  removeReportFile(@Param('id') id: string, @Req() req) {
    return this.eventsService.removeReportFile(id, req.user.id);
  }

  /**
   * PARTICIPANTS
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/register')
  addParticipant(@Param('id') id, @Req() req) {
    return this.eventsService.addParticipant(id, req.user.id);
  }

  @ApiCreatedResponse({
    description: 'Participantes agregados correctamente al evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'Usuario no encontrado / ya es participante',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/participants')
  addParticipants(
    @Param('id') id: string,
    @Body('participants') participants: string[],
    @Req() req,
  ) {
    return this.eventsService.addParticipants(id, participants, req.user.id);
  }

  @ApiOkResponse({
    description: 'Participante eliminado correctamente del evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'El usuario no es participante en el evento.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/participants/:userId')
  removeParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.eventsService.removeParticipant(id, userId, req.user.id);
  }

  /**
   * ACTIVITIES
   */
  @ApiCreatedResponse({
    description: 'Actividades agregadas correctamente al evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'Actividad no encontrada o no es válida.',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/activities')
  addActivities(
    @Param('id') id: string,
    @Body() dto: CreateActivityDto,
    @Req() req,
  ) {
    return this.eventsService.createActivity(id, dto, req.user.id);
  }

  @ApiOkResponse({
    description: 'Actividad eliminada correctamente del evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'Actividad no encontrada en el evento.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':eventId/activities/:activityId')
  removeActivity(
    @Param('eventId') eventId: string,
    @Param('activityId') activityId: string,
    @Req() req,
  ) {
    return this.eventsService.deleteActivity(eventId, activityId, req.user.id);
  }

  /**
   * PRODUCTS
   */
  @ApiCreatedResponse({
    description: 'Productos agregados correctamente al evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'Producto no encontrado o no es válido.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/products')
  addProducts(
    @Param('id') id: string,
    @Body('products') productIds: string[],
    @Req() req,
  ) {
    return this.eventsService.addProducts(id, productIds, req.user.id);
  }

  @ApiOkResponse({
    description: 'Producto eliminado correctamente del evento.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({
    description: 'Producto no encontrado en el evento.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/products/:productId')
  removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Req() req,
  ) {
    return this.eventsService.removeProduct(id, productId, req.user.id);
  }
}
