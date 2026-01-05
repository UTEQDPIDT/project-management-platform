import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { File } from '../schemas/file.schema';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Se subió el archivo correctamente.',
    type: File,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 400, description: 'No se proporcionó el archivo.' })
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.filesService.uploadFile(file, req.user.userId);
  }

  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Metadatos del archivo' })
  @ApiResponse({ status: 404, description: 'Metadatos no encontrados' })
  @Get('metadata/:id')
  getFileMetadata(@Param('id') id: string) {
    return this.filesService.getFileMetadata(id);
  }

  @ApiResponse({ status: 200, description: 'Stream del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Get('stream/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { metadata, stream } =
      await this.filesService.getStream(id);

    stream.on('error', () =>
      res.status(404).send('File not found'),
    );

    stream.pipe(res);
  }

  @ApiResponse({ status: 200, description: 'Descarga del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { metadata, stream } =
      await this.filesService.getStream(id);

    res.set({
      'Content-Type': metadata.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${metadata.name}"`,
    });

    stream.on('error', () =>
      res.status(404).send('Could not read file'),
    );

    stream.pipe(res);
  }

  @ApiResponse({ status: 200, description: 'Archivo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}
