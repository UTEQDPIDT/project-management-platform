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
import { File } from '../schemas/file.schema';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileValidationPipe } from '../common/pipes';
import { FILE_MIME_TYPES } from '../common/constants';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@repo/types';

type AuthenticatedRequest = {
  user: {
    id: string;
    role: UserRole;
  };
};

function sanitizeDownloadFilename(filename: string): string {
  const sanitized = filename
    .replace(/[\r\n"]/g, '')
    .replace(/[\\/]/g, '-')
    .trim();

  return sanitized || 'download';
}

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Se subió el archivo correctamente.',
    type: File,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiBadRequestResponse({ description: 'No se proporcionó el archivo.' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new FileValidationPipe(5 * 1024 * 1024, [
        ...FILE_MIME_TYPES.IMAGES,
        ...FILE_MIME_TYPES.DOCUMENTS,
        ...FILE_MIME_TYPES.OFFICE,
      ]),
    )
    file: Express.Multer.File,
    @Body() body: UploadFileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.filesService.uploadFile(
      file,
      body.entityId,
      body.entityType,
      body.purpose,
      req.user.id,
      req.user.role,
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Se subieron los archivos correctamente.',
    type: Array<File>,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado.' })
  @ApiBadRequestResponse({
    description: 'Ocurrió un error al subir los archivos.',
  })
  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultiple(
    @UploadedFiles(
      new FileValidationPipe(5 * 1024 * 1024, [
        ...FILE_MIME_TYPES.IMAGES,
        ...FILE_MIME_TYPES.DOCUMENTS,
        ...FILE_MIME_TYPES.OFFICE,
      ]),
    )
    files: Array<Express.Multer.File>,
    @Body() body: UploadFileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.filesService.uploadFiles(
      files,
      body.entityId,
      body.entityType,
      body.purpose,
      req.user.id,
      req.user.role,
    );
  }

  @ApiOkResponse({ description: 'Lista de archivos' })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.filesService.findAllVisibleTo(req.user.id, req.user.role);
  }

  @ApiOkResponse({
    description: 'Lista de archivos encontrados por el ID de la entidad padre',
  })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Get('/for-entity/:entityId')
  findFilesForEntity(
    @Param('entityId') entityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.filesService.findFilesForEntityVisibleTo(
      entityId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiOkResponse({ description: 'Metadatos del archivo' })
  @ApiNotFoundResponse({ description: 'Metadatos no encontrados' })
  @Get('metadata/:id')
  getFileMetadata(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.filesService.getFileMetadataForActor(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOkResponse({ description: 'Stream del archivo' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Get('stream/:id')
  async getFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { stream } = await this.filesService.getStreamForActor(
      id,
      req.user.id,
      req.user.role,
    );

    stream.on('error', () => res.status(404).send('File not found'));

    stream.pipe(res);
  }

  @ApiOkResponse({ description: 'Descarga del archivo' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Get('download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const { metadata, stream } = await this.filesService.getStreamForActor(
        id,
        req.user.id,
        req.user.role,
      );

      const safeFilename = sanitizeDownloadFilename(metadata.originalName);

      res.set({
        'Content-Type': metadata.mimetype || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
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
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.filesService.deleteFile(id, req.user.id, req.user.role);
  }

  @ApiOkResponse({ description: 'Archivo eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Archivo no encontrado' })
  @Delete('/by-owner/:ownerId')
  removeByOwner(
    @Param('ownerId') ownerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.filesService.deleteFilesByOwner(
      ownerId,
      req.user.id,
      req.user.role,
    );
  }
}
