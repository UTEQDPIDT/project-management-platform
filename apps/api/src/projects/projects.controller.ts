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
  ApiForbiddenResponse,
} from '@nestjs/swagger';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: string;
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

  // =========================================================================
  // PROJECT VALIDATION ENDPOINTS (Simplified 2-step flow)
  // =========================================================================

  /**
   * Endpoint for administrative users to apply the first level of validation.
   */
  @ApiAcceptedResponse({ description: 'First validation applied successfully.' })
  @ApiBadRequestResponse({ description: 'Project is not in COMPLETED status or validation is already active.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or expired cookie.' })
  @Post(':id/first-validation')
  applyFirstValidation(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.applyFirstValidation(
      id,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Endpoint for the manager/final account to perform the closure validation.
   */
  @ApiAcceptedResponse({ description: 'Project closed successfully.' })
  @ApiBadRequestResponse({ description: 'Project does not satisfy completion status or lacks first validation.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or expired cookie.' })
  @Post(':id/close')
  closeProject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.closeProject(id, req.user.id);
  }

  /**
   * Endpoint to unlock and reopen a closed project.
   */
  @ApiAcceptedResponse({ description: 'Project reopened successfully.' })
  @ApiBadRequestResponse({ description: 'Project is not closed.' })
  @ApiForbiddenResponse({ description: 'Only the user who closed the project can reopen it.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or expired cookie.' })
  @Post(':id/reopen')
  reopenProject(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.reopenProject(id, req.user.id);
  }
}