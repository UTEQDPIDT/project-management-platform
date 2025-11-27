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
  BadRequestException,
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const savedFile = await this.filesService.uploadToGridFS(file, req.user.id);

    return savedFile;
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
  async getFileMetadata(@Param('id') id: string) {
    const metadata = await this.filesService.getFileMetadata(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    return metadata;
  }

  @ApiResponse({ status: 200, description: 'Stream del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Get('stream/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid file ID');
    }

    const metadata = await this.filesService.getFileMetadata(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    const fileStream = await this.filesService.getFileStream(
      metadata.gridFsId.toHexString(),
    );

    fileStream.on('error', () => res.status(404).send('File not found'));

    fileStream.pipe(res);
  }

  @ApiResponse({ status: 200, description: 'Descarga del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid file ID');
    }

    // 1. get file metadata
    const metadata = await this.filesService.getFileMetadata(id);

    if (!metadata) {
      throw new NotFoundException('File metadata not found');
    }

    // 2. get GridFS download stream
    const fileStream = await this.filesService.getFileStream(
      metadata.gridFsId.toHexString(),
    );

    // 3. set headers
    res.set({
      'Content-Type': metadata.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${metadata.name}"`,
    });

    // 4. Pipe GridFS strem to the response
    fileStream.on('error', () => {
      return res.status(404).send('Could not read file');
    });

    fileStream.pipe(res);
  }

  @ApiResponse({ status: 200, description: 'Archivo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}
