import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiConsumes,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateProductDto } from '../products/dto/create-product.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiCreatedResponse({
    description: 'Proyecto creado correctamente.',
    type: CreateProjectDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  create(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @ApiAcceptedResponse({
    description: 'Lista de proyectos obtenida correctamente.',
    type: [CreateProjectDto],
  })
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @ApiAcceptedResponse({ description: 'Proyectos encontrados por dueño.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Get('/by-owner')
  findByOwner(@Req() req) {
    return this.projectsService.findByOwner(req.user.id);
  }

  @ApiAcceptedResponse({ description: 'Proyectos encontrados por equipo.' })
  @ApiNotFoundResponse({
    description: 'No hay proyectos con el ID del equipo proporcionado.',
  })
  @Get('/by-team/:teamId')
  findByTeam(@Param('teamId') teamId) {
    return this.projectsService.findByTeam(teamId);
  }

  @ApiAcceptedResponse({
    description: 'Proyecto obtenido correctamente.',
    type: CreateProjectDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @ApiAcceptedResponse({
    description: 'Proyecto actualizado correctamente.',
    type: UpdateProjectDto,
  })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @ApiAcceptedResponse({ description: 'Proyecto eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  /**
   * Products
   */
  @ApiAcceptedResponse({
    description:
      'Producto creado y añadido al arreglo de Productos correctamente.',
  })
  @ApiBadRequestResponse({ description: 'Se abortó la transacción' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/products')
  createProduct(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProductDto,
    @Req() req,
  ) {
    return this.projectsService.createProduct(projectId, dto, req.user.id);
  }

  @ApiAcceptedResponse({
    description:
      'Producto eliminado y extraído del arreglo de Productos correctamente.',
  })
  @ApiBadRequestResponse({ description: 'Se abortó la transacción' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/products/:productId')
  deleteProduct(
    @Param('projectId') projectId: string,
    @Param('productId') productId: string,
    @Req() req,
  ) {
    return this.projectsService.deleteProduct(
      projectId,
      productId,
      req.user.id,
    );
  }

  /**
   * Activities
   */
  @ApiAcceptedResponse({
    description:
      'Producto creado y añadido al arreglo de Productos correctamente.',
  })
  @ApiBadRequestResponse({ description: 'Se abortó la transacción' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post(':projectId/activities')
  async createActivity(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProductDto,
    @Req() req,
  ) {
    return this.projectsService.createActivity(projectId, dto, req.user.id);
  }

  @ApiAcceptedResponse({
    description:
      'Producto creado y añadido al arreglo de Productos correctamente.',
  })
  @ApiBadRequestResponse({ description: 'Se abortó la transacción' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':projectId/activities/:activityId')
  async deleteActivity(
    @Param('projectId') projectId: string,
    @Param('activityId') activityId: string,
    @Req() req,
  ) {
    return this.projectsService.deleteActivity(
      projectId,
      activityId,
      req.user.id,
    );
  }
}
