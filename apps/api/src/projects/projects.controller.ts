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
}
