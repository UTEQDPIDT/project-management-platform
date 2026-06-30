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
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiConsumes,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

type AuthenticatedRequest = {
  user: {
    id: string;
  };
};

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiCreatedResponse({
    description: 'Proyecto creado correctamente.',
    type: CreateProjectDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @Post()
  @ApiConsumes('multipart/form-data')
  create(@Body() createProjectDto: CreateProjectDto, @Req() req: AuthenticatedRequest) {
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
  @Get('/by-owner')
  findByOwner(@Req() req: AuthenticatedRequest) {
    return this.projectsService.findByOwner(req.user.id);
  }

  @ApiAcceptedResponse({ description: 'Proyectos encontrados por equipo.' })
  @ApiNotFoundResponse({
    description: 'No hay proyectos con el ID del equipo proporcionado.',
  })
  @Get('/by-team/:teamId')
  findByTeam(@Param('teamId') teamId: string) {
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
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: AuthenticatedRequest,
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
