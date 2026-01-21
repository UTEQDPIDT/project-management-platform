import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
import { AbilitiesGuard } from '../casl/abilities.guard';
import { CheckAbilities } from '../casl/abilities.decorator';
import { Action } from '../casl/ability.factory';
import { Event } from '../schemas/event.schema';
import { EventResourceInterceptor } from './interceptors/event-resource.interceptor';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  //ADMIN ONLY
  @ApiCreatedResponse({ description: 'Evento creado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: Event })
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  //ANY AUTHENTICATED USER
  @ApiOkResponse({ description: 'Lista de eventos obtenida correctamente.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Event })
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  //ANY AUTHENTICATED USER
  @ApiOkResponse({ description: 'Evento obtenido correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Event })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  //ADMIN ONLY
  @ApiOkResponse({ description: 'Evento actualizado correctamente.', type: UpdateEventDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: Event })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Req() req) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  //ADMIN ONLY
  @ApiOkResponse({ description: 'Evento eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: Event })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  /**
   * PARTICIPANTS
   */
  //PARTICIPANTS ONLY
  @ApiCreatedResponse({ description: 'Participante agregado correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(EventResourceInterceptor)
  @CheckAbilities({ action: Action.UpdateContent, subject: Event })
  @Patch(':id/register')
  addParticipant(@Param('id') id, @Req() req) {
    return this.eventsService.addParticipant(id, req.user.id);
  }

  //ADMIN ONLY
  @ApiCreatedResponse({ description: 'Participantes agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Usuario no encontrado / ya es participante.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: Event })
  @Patch(':id/participants')
  addParticipants(@Param('id') id: string, @Body('participants') participants: string[], @Req() req) {
    return this.eventsService.addParticipants(id, participants, req.user.id);
  }

  //TODO: Create a separate route for users to unregister themselves (for the sake of CASL permissions)
  //ADMIN ONLY
  @ApiOkResponse({ description: 'Participante eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'El usuario no es participante en el evento.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: Event })
  @Delete(':id/participants/:userId')
  removeParticipant(@Param('id') id: string, @Param('userId') userId: string, @Req() req) {
    return this.eventsService.removeParticipant(id, userId, req.user.id);
  }

  /**
   * PRODUCTS
   */

  //PARTICIPANTS AND ADMINS ONLY
  @ApiCreatedResponse({ description: 'Productos agregados correctamente al evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado o no es válido.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(EventResourceInterceptor)
  @CheckAbilities({ action: Action.UpdateContent, subject: Event })
  @Patch(':id/products')
  addProducts(@Param('id') id: string, @Body('products') productIds: string[], @Req() req) {
    return this.eventsService.addProducts(id, productIds, req.user.id);
  }

  //PARTICIPANTS AND ADMINS ONLY
  @ApiOkResponse({ description: 'Producto eliminado correctamente del evento.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiBadRequestResponse({ description: 'Producto no encontrado en el evento.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(EventResourceInterceptor)
  @CheckAbilities({ action: Action.UpdateContent, subject: Event })
  @Delete(':id/products/:productId')
  removeProduct(@Param('id') id: string, @Param('productId') productId: string, @Req() req ) {
    return this.eventsService.removeProduct(id, productId, req.user.id);
  }
}
