import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @ApiOkResponse({ description: 'Lista de eventos obtenida correctamente.' })
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // Place this route BEFORE ':id' to avoid route collision
  @ApiOkResponse({
    description: 'Lista de eventos del usuario obtenida correctamente.',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Get('by-user')
  findByUser(@Req() req) {
    return this.eventsService.findByUser(req.user.id);
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
