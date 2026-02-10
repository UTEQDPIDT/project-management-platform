import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiAcceptedResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiTags, ApiConsumes, ApiBadRequestResponse } from '@nestjs/swagger';
import { AbilitiesGuard } from '../casl/abilities.guard';
import { CheckAbilities } from '../casl/abilities.decorator';
import { Action } from '../casl/ability.factory';
import { Project } from '../schemas';
import { ProjectResourceInterceptor } from './interceptors/project-resource.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  //ANY AUTHENTICATED USER
  @ApiCreatedResponse({description: 'Proyecto creado correctamente.', type: CreateProjectDto})
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: Project })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({description: 'Lista de proyectos obtenida correctamente.', type: [CreateProjectDto]})
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Project })
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({ description: 'Proyectos encontrados por dueño.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Project })
  @Get('/by-owner')
  findByOwner(@Req() req) {
    return this.projectsService.findByOwner(req.user.id);
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({ description: 'Proyectos encontrados por equipo.' })
  @ApiNotFoundResponse({ description: 'No hay proyectos con el ID del equipo proporcionado.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Project })
  @Get('/by-team/:teamId')
  findByTeam(@Param('teamId') teamId) {
    return this.projectsService.findByTeam(teamId);
  }

  //ANY AUTHENTICATED USER
  @ApiAcceptedResponse({ description: 'Proyecto obtenido correctamente.', type: CreateProjectDto })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: Project })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  //OWNER ONLY
  @ApiAcceptedResponse({ description: 'Proyecto actualizado correctamente.', type: UpdateProjectDto })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(ProjectResourceInterceptor)
  @CheckAbilities({ action: Action.Update, subject: Project })
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Req() req) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  //OWNER ONLY
  @ApiAcceptedResponse({ description: 'Proyecto eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @UseInterceptors(ProjectResourceInterceptor)
  @CheckAbilities({ action: Action.Delete, subject: Project })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
