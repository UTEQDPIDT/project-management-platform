import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFiles} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiAcceptedResponse, ApiCreatedResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiTags, ApiConsumes} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiCreatedResponse({description: 'Proyecto creado correctamente.', type: CreateProjectDto})
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  create(@Body() createProjectDto: CreateProjectDto, @Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    return this.projectsService.create(createProjectDto, req.user.id, files);
  }

  @ApiAcceptedResponse({description: 'Lista de proyectos obtenida correctamente.', type: [CreateProjectDto]})
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @ApiAcceptedResponse({description: 'Proyecto obtenido correctamente.', type: CreateProjectDto})
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @ApiAcceptedResponse({description: 'Proyecto actualizado correctamente.', type: UpdateProjectDto})
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    return this.projectsService.update(id, updateProjectDto, req.user.id, files);
  }

  @ApiAcceptedResponse({ description: 'Archivo eliminado del proyecto correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto o el archivo.' })
  @ApiUnauthorizedResponse({ description: 'No autorizado o Cookie expirada.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/projectFiles')
  removeFileFromProject(@Param('id') id: string, @Body('fileId') fileId: string, @Req() req) {
    return this.projectsService.removeFile(id, fileId, req.user.id);
  }

  @ApiAcceptedResponse({ description: 'Proyecto eliminado correctamente.' })
  @ApiNotFoundResponse({ description: 'No se encontro el proyecto.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
