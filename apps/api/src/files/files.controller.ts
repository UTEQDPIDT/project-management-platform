import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { File } from '../schemas/file.schema';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileValidationPipe } from '../common/pipes';
import { ALLOWED_MIME_TYPES } from '../common/constants';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Se subió el archivo correctamente.',
    type: File,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiBadRequestResponse({ description: 'No se proporcionó el archivo.' })
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new FileValidationPipe(5 * 1024 * 1024, ALLOWED_MIME_TYPES))
    file: Express.Multer.File,
    @Body() body: UploadFileDto,
    @Req() req,
  ) {
    return this.filesService.uploadFile(
      file,
      body.entityId,
      body.entityType,
      req.user.id,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Se subiieron los archivos correctamente.',
    type: Array<File>,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiBadRequestResponse({
    description: 'Ocurrió un error al subir los archivos.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiple(
    @UploadedFiles(new FileValidationPipe(5 * 1024 * 1024, ALLOWED_MIME_TYPES))
    files: Array<Express.Multer.File>,
    @Body() body: UploadFileDto,
    @Req() req,
  ) {
    return this.filesService.uploadFiles(
      files,
      body.entityId,
      body.entityType,
      req.user.id,
    );
  }

  @ApiOkResponse({ description: 'Lista de archivos' })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @ApiOkResponse({
    description: 'Lista de archivos encontrados por el ID de la entidad padre',
  })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Get('/for-entity/:entityId')
  findFilesForEntity(@Param('entityId') entityId: string) {
    return this.filesService.findFilesForEntity(entityId);
  }

  @ApiOkResponse({ description: 'Metadatos del archivo' })
  @ApiNotFoundResponse({ description: 'Metadatos no encontrados' })
  @Get('metadata/:id')
  getFileMetadata(@Param('id') id: string) {
    return this.filesService.getFileMetadata(id);
  }

  @ApiOkResponse({ description: 'Stream del archivo' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Get('stream/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { stream } = await this.filesService.getStream(id);

    stream.on('error', () => res.status(404).send('File not found'));

    stream.pipe(res);
  }

  @ApiOkResponse({ description: 'Descarga del archivo' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const { metadata, stream } = await this.filesService.getStream(id);

      res.set({
        'Content-Type': metadata.mimetype || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
        'Content-Length': metadata.size.toString(),
      });

      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(404).send('Could not read file');
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(404).send('File not found');
      }
    }
  }

  @ApiOkResponse({ description: 'Archivo eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }

  @ApiOkResponse({ description: 'Archivo eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Delete('/by-owner/:ownerId')
  removeByOwner(@Param('ownerId') ownerId: string) {
    return this.filesService.deleteFilesByOwner(ownerId);
  }
}
